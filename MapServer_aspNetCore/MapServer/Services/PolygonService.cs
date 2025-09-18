using MongoDB.Driver;
using MapServer.Models;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MapServer.Services
{
    public class PolygonService
    {
        private readonly IMongoCollection<PolygonDoc> _polygons;

        public PolygonService(IOptions<MongoDbSettings> mongoSettings)
        {
            var client = new MongoClient(mongoSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
            _polygons = database.GetCollection<PolygonDoc>("Polygons");
        }

        public async Task<List<PolygonDoc>> GetAllAsync() =>
            await _polygons.Find(_ => true).ToListAsync();

        public async Task<PolygonDoc> CreateAsync(PolygonDoc polygon)
        {
            await _polygons.InsertOneAsync(polygon);
            return polygon;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _polygons.DeleteOneAsync(p => p.Id == id);
            return result.DeletedCount > 0;
        }
    }
}