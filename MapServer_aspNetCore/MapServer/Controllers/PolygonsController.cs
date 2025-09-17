using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using NetTopologySuite.Geometries;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MapServer.Controllers
{
    // הגדרת המודלים כאן
    public class PolygonDocument
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public Polygon? Geometry { get; set; }
        
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class PolygonCreateRequest
    {
        public PolygonGeoJson? Polygon { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class PolygonGeoJson
    {
        public string Type { get; set; } = "Polygon";
        public double[][][]? Coordinates { get; set; }
    }

    public class PolygonResponseDto
    {
        public string? Id { get; set; }
        public PolygonGeoJson? Geometry { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PolygonsController : ControllerBase
    {
        private readonly IMongoCollection<PolygonDocument> _polygons;

        public PolygonsController(IMongoClient client)
        {
            var database = client.GetDatabase("MapDB");
            _polygons = database.GetCollection<PolygonDocument>("Polygons");
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var polygons = await _polygons.Find(_ => true).ToListAsync();
                
                // המרה ל-DTO
                var response = polygons.Select(p => new PolygonResponseDto
                {
                    Id = p.Id,
                    Geometry = p.Geometry != null ? new PolygonGeoJson
                    {
                        Type = "Polygon",
                        Coordinates = ConvertPolygonToCoordinates(p.Geometry)
                    } : null,
                    Properties = p.Properties
                }).ToList();
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving polygons: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PolygonCreateRequest request)
        {
            try
            {
                if (request.Polygon == null)
                    return BadRequest("Polygon is required");
                
                var polygon = CreatePolygonFromGeoJson(request.Polygon);
                
                var document = new PolygonDocument
                {
                    Geometry = polygon,
                    Properties = request.Properties
                };

                await _polygons.InsertOneAsync(document);
                
                // החזר DTO
                var response = new PolygonResponseDto
                {
                    Id = document.Id,
                    Geometry = new PolygonGeoJson
                    {
                        Type = "Polygon",
                        Coordinates = ConvertPolygonToCoordinates(document.Geometry)
                    },
                    Properties = document.Properties
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating polygon: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _polygons.DeleteOneAsync(p => p.Id == id);
                
                if (result.DeletedCount == 0)
                    return NotFound();
                    
                return Ok(new { deleted = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting polygon: {ex.Message}");
            }
        }

        private Polygon CreatePolygonFromGeoJson(PolygonGeoJson geoJson)
        {
            if (geoJson.Type != "Polygon")
                throw new ArgumentException("Invalid GeoJSON type. Expected 'Polygon'.");

            if (geoJson.Coordinates == null || geoJson.Coordinates.Length == 0)
                throw new ArgumentException("Polygon must have at least one ring.");

            // וידוא שהטבעת סגורה - הנקודה הראשונה והאחרונה זהות
            var ringCoordinates = geoJson.Coordinates[0];
            if (ringCoordinates.Length > 0 && 
                (ringCoordinates[0][0] != ringCoordinates[ringCoordinates.Length - 1][0] ||
                 ringCoordinates[0][1] != ringCoordinates[ringCoordinates.Length - 1][1]))
            {
                // הוסף את הנקודה הראשונה לסוף כדי לסגור את הטבעת
                var closedRing = new double[ringCoordinates.Length + 1][];
                Array.Copy(ringCoordinates, closedRing, ringCoordinates.Length);
                closedRing[ringCoordinates.Length] = new double[] { ringCoordinates[0][0], ringCoordinates[0][1] };
                ringCoordinates = closedRing;
            }

            // יצירת LinearRing מהקואורדינטות
            var coordinates = new Coordinate[ringCoordinates.Length];
            for (int i = 0; i < ringCoordinates.Length; i++)
            {
                coordinates[i] = new Coordinate(ringCoordinates[i][0], ringCoordinates[i][1]);
            }

            var shell = new LinearRing(coordinates);

            // יצירת Polygon
            return new Polygon(shell);
        }

        private double[][][] ConvertPolygonToCoordinates(Polygon polygon)
        {
            if (polygon == null) return new double[0][][];

            var coordinates = new double[1][][];
            coordinates[0] = polygon.Coordinates
                .Select(c => new double[] { c.X, c.Y })
                .ToArray();
            
            return coordinates;
        }
    }
}