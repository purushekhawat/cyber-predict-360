from fastapi import APIRouter
from app.api.v1.endpoints import health, synthetic, predictions, graph, simulation

api_router = APIRouter()

# Include version 1 endpoints
api_router.include_router(health.router, prefix="/health", tags=["Health Checks"])
api_router.include_router(synthetic.router, prefix="/synthetic", tags=["Synthetic Data Analytics"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Withdrawal Forecast Predictions"])
api_router.include_router(graph.router, prefix="/graph", tags=["Neo4j Financial Relationship Graph"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Counterfactual Simulation Engine"])
