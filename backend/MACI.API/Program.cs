using Serilog;
using MACI.Core.Agents;
using MACI.Core.Agents.Interfaces;
using MACI.Core.Options;
using MACI.Core.Services;
using MACI.Core.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Load .env file from root of project
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "../../.env");
if (File.Exists(envPath))
{
    DotNetEnv.Env.Load(envPath);
    builder.Configuration.AddEnvironmentVariables();
}

// Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("MACIPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Options
builder.Services.Configure<GroqOptions>(builder.Configuration.GetSection("Groq"));
builder.Services.Configure<PipelineOptions>(builder.Configuration.GetSection("Pipeline"));

// HttpClient
builder.Services.AddHttpClient<IGroqService, GroqService>();

// Services
builder.Services.AddScoped<ICodeExecutorService, CodeExecutorService>();

// Agents
builder.Services.AddScoped<IMasterAgent, MasterAgent>();
builder.Services.AddScoped<IWriterAgent, WriterAgent>();
builder.Services.AddScoped<IVerifierAgent, VerifierAgent>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("MACIPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();