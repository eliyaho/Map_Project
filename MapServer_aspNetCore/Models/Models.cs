using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using NetTopologySuite.Geometries;

namespace MapServer.Models
{
    public class PolygonDocument
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public Polygon? Geometry { get; set; }
        
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class GeoObject
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public Point? Location { get; set; }
        
        public string Type { get; set; } = "marker";
        
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

    // DTOs for response
    public class PolygonResponseDto
    {
        public string? Id { get; set; }
        public PolygonGeoJson? Geometry { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class GeoObjectResponseDto
    {
        public string? Id { get; set; }
        public PointGeoJson? Location { get; set; }
        public string Type { get; set; } = "marker";
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }
}