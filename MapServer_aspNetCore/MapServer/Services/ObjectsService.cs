using MongoDB.Driver;
using MapServer.Models;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MapServer.Services
{
    public class ObjectsService
    {
        private readonly IMongoCollection<GeoObject> _objects;

        public ObjectsService(IOptions<MongoDbSettings> mongoSettings)
        {
            var client = new MongoClient(mongoSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
            _objects = database.GetCollection<GeoObject>("Objects");
        }

        public async Task<List<GeoObject>> GetAllAsync() =>
            await _objects.Find(_ => true).ToListAsync();

        public async Task<GeoObject> CreateAsync(GeoObject obj)
        {
            await _objects.InsertOneAsync(obj);
            return obj;
        }

        public async Task<List<GeoObject>> CreateBulkAsync(List<GeoObject> objs)
        {
            if (objs.Count > 0)
                await _objects.InsertManyAsync(objs);
            return objs;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _objects.DeleteOneAsync(o => o.Id == id);
            return result.DeletedCount > 0;
        }
    }
}