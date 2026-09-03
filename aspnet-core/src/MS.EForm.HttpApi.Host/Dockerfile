# Build context PHẢI là thư mục aspnet-core/ (để COPY được các project khác trong solution).
# Ví dụ build tay: docker build -f src/MS.EForm.HttpApi.Host/Dockerfile -t eform-httpapi-host .

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY MS.EForm.sln ./
COPY NuGet.Config ./
COPY common.props ./
COPY src/ ./src/

RUN dotnet restore src/MS.EForm.HttpApi.Host/MS.EForm.HttpApi.Host.csproj
RUN dotnet publish src/MS.EForm.HttpApi.Host/MS.EForm.HttpApi.Host.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

# Render inject cổng qua biến $PORT, nên phải bind Kestrel lúc container start (không cố định lúc build).
ENTRYPOINT ["/bin/sh", "-c", "ASPNETCORE_URLS=http://+:$PORT dotnet MS.EForm.HttpApi.Host.dll"]
