using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MapServer.Models
{
    public class PolygonDoc
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("vertices")]
        [Required]
        public List<double[]> Vertices { get; set; } = new List<double[]>();

        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }
}