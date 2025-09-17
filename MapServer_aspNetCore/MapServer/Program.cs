using Microsoft.AspNetCore.Http.Json;
using MongoDB.Driver;
using Newtonsoft.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// הוספת שירותים עם NewtonsoftJson
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ContractResolver = new DefaultContractResolver();
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

// קונפיגורציה של MongoDB
builder.Services.AddSingleton<IMongoClient>(serviceProvider =>
{
    var connectionString = builder.Configuration.GetConnectionString("MongoDB");
    return new MongoClient(connectionString);
});

// הוספת CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Middleware
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();