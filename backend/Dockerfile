# Stage 1: Build the backend app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /app

# Copy csproj and restore dependencies
COPY SeedHR.Backend.csproj ./
RUN dotnet restore

# Copy the remaining source code and publish
COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build-env /app/out ./

# Copy configuration files
COPY .env ./
COPY appsettings*.json ./

# Create directory for file uploads
RUN mkdir -p uploads/documents uploads/cvs

# Expose port and define entrypoint
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "SeedHR.Backend.dll"]
