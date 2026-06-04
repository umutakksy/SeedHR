# Stage 1: Build the frontend app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copy csproj and restore dependencies
COPY frontend.csproj ./
RUN dotnet restore

# Copy the remaining source code and publish
COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out ./

# Expose port and define entrypoint
EXPOSE 5200
ENV ASPNETCORE_URLS=http://+:5200
ENTRYPOINT ["dotnet", "frontend.dll"]
