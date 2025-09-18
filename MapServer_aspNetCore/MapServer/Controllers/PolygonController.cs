using Microsoft.AspNetCore.Mvc;
using MapServer.Models;
using MapServer.Services;
using System.Threading.Tasks;

namespace MapServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PolygonController : ControllerBase
    {
        private readonly PolygonService _polygonService;

        public PolygonController(PolygonService polygonService)
        {
            _polygonService = polygonService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var polygons = await _polygonService.GetAllAsync();
            return Ok(polygons);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PolygonDoc polygonDoc)
        {
            var created = await _polygonService.CreateAsync(polygonDoc);
            return Ok(created);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _polygonService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return Ok(new { deleted = true });
        }
    }
}