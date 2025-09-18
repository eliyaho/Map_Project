using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace MapServer.Models
{
    public class GeoObject
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("location")]
        public PointLocation Location { get; set; } = new PointLocation();

        public string Type { get; set; } = "marker";

        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class PointLocation
    {
        public string Type { get; set; } = "Point";
        public double[] Coordinates { get; set; } = new double[2] { 0, 0 };
    }

    public class ObjectCreateRequest
    {
        public string Type { get; set; } = "Feature";
        
        public PointGeoJson Geometry { get; set; } = new PointGeoJson();
        
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class PointGeoJson
    {
        public string Type { get; set; } = "Point";
        
        public double[] Coordinates { get; set; } = new double[2] { 0, 0 };
    }

    public class BulkObjectsRequest
    {
        public List<ObjectCreateRequest> Features { get; set; } = new List<ObjectCreateRequest>();
    }
}