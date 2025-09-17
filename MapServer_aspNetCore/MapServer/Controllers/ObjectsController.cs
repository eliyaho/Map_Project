using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using NetTopologySuite.Geometries;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MapServer.Controllers
{
    // הגדרת המודלים כאן
    public class GeoObject
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public Point? Location { get; set; }
        
        public string Type { get; set; } = "marker";
        
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class ObjectCreateRequest
    {
        public string Type { get; set; } = "Feature";
        public PointGeoJson? Geometry { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class PointGeoJson
    {
        public string Type { get; set; } = "Point";
        public double[]? Coordinates { get; set; }
    }

    public class BulkObjectsRequest
    {
        public List<ObjectCreateRequest> Features { get; set; } = new List<ObjectCreateRequest>();
    }

    public class GeoObjectResponseDto
    {
        public string? Id { get; set; }
        public PointGeoJson? Location { get; set; }
        public string Type { get; set; } = "marker";
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ObjectsController : ControllerBase
    {
        private readonly IMongoCollection<GeoObject> _objects;

        public ObjectsController(IMongoClient client)
        {
            var database = client.GetDatabase("MapDB");
            _objects = database.GetCollection<GeoObject>("Objects");
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var objects = await _objects.Find(_ => true).ToListAsync();
                
                // המרה ל-DTO
                var response = objects.Select(o => new GeoObjectResponseDto
                {
                    Id = o.Id,
                    Location = o.Location != null ? new PointGeoJson
                    {
                        Type = "Point",
                        Coordinates = new double[] { o.Location.X, o.Location.Y }
                    } : null,
                    Type = o.Type,
                    Properties = o.Properties
                }).ToList();
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving objects: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ObjectCreateRequest request)
        {
            try
            {
                if (request.Geometry == null || request.Geometry.Coordinates == null)
                    return BadRequest("Geometry is required");
                
                var point = CreatePointFromGeoJson(request.Geometry);
                
                var geoObject = new GeoObject
                {
                    Location = point,
                    Type = request.Properties.TryGetValue("type", out var type) ? type?.ToString() ?? "marker" : "marker",
                    Properties = request.Properties
                };

                await _objects.InsertOneAsync(geoObject);
                
                // החזר DTO
                var response = new GeoObjectResponseDto
                {
                    Id = geoObject.Id,
                    Location = new PointGeoJson
                    {
                        Type = "Point",
                        Coordinates = new double[] { geoObject.Location.X, geoObject.Location.Y }
                    },
                    Type = geoObject.Type,
                    Properties = geoObject.Properties
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating object: {ex.Message}");
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulk([FromBody] BulkObjectsRequest request)
        {
            try
            {
                var objectsToInsert = new List<GeoObject>();
                
                foreach (var feature in request.Features)
                {
                    if (feature.Geometry == null || feature.Geometry.Coordinates == null)
                        continue;
                    
                    var point = CreatePointFromGeoJson(feature.Geometry);
                    
                    objectsToInsert.Add(new GeoObject
                    {
                        Location = point,
                        Type = feature.Properties.TryGetValue("type", out var type) ? type?.ToString() ?? "marker" : "marker",
                        Properties = feature.Properties
                    });
                }

                if (objectsToInsert.Count == 0)
                    return BadRequest("No valid objects to insert");
                
                await _objects.InsertManyAsync(objectsToInsert);
                
                // החזר את כל האובייקטים מהמסד
                var allObjects = await _objects.Find(_ => true).ToListAsync();
                var response = allObjects.Select(o => new GeoObjectResponseDto
                {
                    Id = o.Id,
                    Location = o.Location != null ? new PointGeoJson
                    {
                        Type = "Point",
                        Coordinates = new double[] { o.Location.X, o.Location.Y }
                    } : null,
                    Type = o.Type,
                    Properties = o.Properties
                }).ToList();
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating objects in bulk: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _objects.DeleteOneAsync(o => o.Id == id);
                
                if (result.DeletedCount == 0)
                    return NotFound();
                    
                return Ok(new { deleted = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting object: {ex.Message}");
            }
        }

        private Point CreatePointFromGeoJson(PointGeoJson geoJson)
        {
            if (geoJson.Type != "Point")
                throw new ArgumentException("Invalid GeoJSON type. Expected 'Point'.");

            if (geoJson.Coordinates == null || geoJson.Coordinates.Length < 2)
                throw new ArgumentException("Point must have at least 2 coordinates.");

            return new Point(geoJson.Coordinates[0], geoJson.Coordinates[1]);
        }
    }
}