using Microsoft.AspNetCore.Mvc;
using MapServer.Models;
using MapServer.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MapServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ObjectsController : ControllerBase
    {
        private readonly ObjectsService _objectsService;

        public ObjectsController(ObjectsService objectsService)
        {
            _objectsService = objectsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var objs = await _objectsService.GetAllAsync();
            return Ok(objs);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ObjectCreateRequest request)
        {
            if (request.Geometry?.Coordinates == null || request.Geometry.Coordinates.Length < 2)
                return BadRequest("Invalid coordinates");
                
            var obj = new GeoObject
            {
                Location = new PointLocation 
                { 
                    Type = "Point",
                    Coordinates = request.Geometry.Coordinates
                },
                Type = request.Properties.TryGetValue("type", out var t) ? t?.ToString() ?? "marker" : "marker",
                Properties = request.Properties
            };
            
            var created = await _objectsService.CreateAsync(obj);
            return Ok(created);
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulk([FromBody] BulkObjectsRequest request)
        {
            if (request.Features == null || request.Features.Count == 0)
                return BadRequest("No features provided");

            var objs = request.Features
                .Where(f => f.Geometry?.Coordinates != null && f.Geometry.Coordinates.Length >= 2)
                .Select(f => new GeoObject
                {
                    Location = new PointLocation 
                    { 
                        Type = "Point",
                        Coordinates = f.Geometry.Coordinates
                    },
                    Type = f.Properties.TryGetValue("type", out var t) ? t?.ToString() ?? "marker" : "marker",
                    Properties = f.Properties
                }).ToList();

            if (objs.Count == 0)
                return BadRequest("No valid objects to create");

            var created = await _objectsService.CreateBulkAsync(objs);
            return Ok(created);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _objectsService.DeleteAsync(id);
            if (deleted == false) return NotFound();
            return Ok(new { deleted = true });
        }
    }
}