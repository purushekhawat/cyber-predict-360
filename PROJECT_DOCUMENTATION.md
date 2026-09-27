# CYBER-PREDICT 360: Comprehensive System Documentation & Technical Specification

**Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance**

- **Problem Statement ID**: 26184
- **Organization**: Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA)
- **Phase**: Production-Grade Prototype & Modular Foundation
- **Document Version**: 2.0.0

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Complete Tech Stack Breakdown](#-complete-tech-stack-breakdown)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Comprehensive Menu Items & Feature Breakdown](#-comprehensive-menu-items--feature-breakdown)
5. [Algorithmic & Mathematical Models](#-algorithmic--mathematical-models)
6. [API Endpoints Catalog](#-api-endpoints-catalog)
7. [Security, Privacy & Synthetic Data Guardrails](#-security-privacy--synthetic-data-guardrails)

---

## 🎯 Executive Summary & Problem Statement

### The Challenge
Cyber financial frauds (UPI scams, phishing, investment frauds, impersonation) often involve rapid multi-hop transfers through mule accounts. The ultimate objective of fraudsters is to convert digital money into untraceable physical cash at automated teller machines (ATMs). 

### The Solution: CYBER-PREDICT 360
CYBER-PREDICT 360 provides law enforcement agencies (I4C, MHA, State Police Cyber Cells) with an **advance spatial-temporal risk forecast**. When an NCRP complaint is logged, the framework predicts:
- **WHERE**: Top candidate ATM locations for physical cash withdrawal.
- **WHEN**: The predicted post-incident time window (e.g. 1.18 - 3.68 hours).
- **WHY**: SHAP-driven feature contributions behind the model's prediction.
- **CONFIDENCE**: Multi-signal audited confidence index verified by an adversarial AI Red-Team challenge.

---

## 🛠️ Complete Tech Stack Breakdown

| Layer / Subsystem | Primary Technology | Version | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `v14.2.5` | SSR/CSR React dashboard, routing, dynamic page state |
| **Frontend Language** | TypeScript | `v5.5.3` | Type-safe UI components, interfaces, and API contracts |
| **Styling & Icons** | Vanilla CSS + Tailwind CSS | `v3.4.6` | Modern UI styling, glassmorphism, responsive grids, Lucide Icons |
| **Geospatial Mapping** | Leaflet + React-Leaflet | `v1.9.4` | Dynamic maps, heatmaps, ATM marker clusters, spatial radius circles |
| **Core API Backend** | Python + FastAPI | `v3.11` / `0.109+` | High-performance asynchronous REST API backend |
| **Database ORM** | SQLAlchemy 2.0 + GeoAlchemy2 | `v2.0.27` / `0.14` | PostGIS spatial queries, Spatial Reference Systems (SRID 4326) |
| **ML Inference Engine** | Python + FastAPI | `v3.11` / `0.109+` | Standalone microservice for ML scoring & prediction pipelines |
| **Data & ML Libraries** | NumPy, Pandas, Scikit-Learn | `1.26+` / `2.2+` / `1.4+` | Spatial DBSCAN clustering, decay functions, time-lag PDF math |
| **Spatial Database** | PostgreSQL + PostGIS | `16-3.4` (PostGIS 3.4) | GIST spatial indexing (`atm_location_geom_idx`) on `geometry(Point, 4326)` |
| **Graph Database** | Neo4j Graph Database | `v5.x` | Graph schema (Victim ➔ Mule L1 ➔ Mule L2 ➔ ATM) and Cypher queries |
| **Containerization** | Docker & Docker Compose | Multi-container | Local orchestration of DB, Core API, ML Engine & Frontend |

---

## 🏗️ System Architecture & Data Flow

```
                                  ┌────────────────────────────────────────┐
                                  │    Law Enforcement Dashboard (3000)    │
                                  │   (Next.js 14 + TS + Tailwind CSS)     │
                                  └───────────────────┬────────────────────┘
                                                      │
                                   HTTP REST / JSON   │
                                ┌─────────────────────┴─────────────────────┐
                                ▼                                           ▼
┌───────────────────────────────────────────────┐   ┌───────────────────────────────────────────────┐
│        Core REST API Backend (Port 8000)      │   │        ML Inference Engine (Port 8001)        │
│          (FastAPI + Python 3.11)              │   │          (FastAPI + Scikit-Learn)            │
│  - Complaint Ingestion & Management           │   │  - Spatial Candidate Ranking (WHERE)          │
│  - Spatial Queries & Distance Radius          │   │  - Time-Window PDF Exponential (WHEN)         │
│  - Counterfactual Scenario Engine             │   │  - SHAP Feature Attribution (WHY)             │
└───────────────────────┬───────────────────────┘   │  - AI Red-Team Adversarial Audit              │
                        │                           └───────────────────────────────────────────────┘
                        │ SQLAlchemy 2 / GeoAlchemy2
                        ▼
┌───────────────────────────────────────────────┐
│       PostgreSQL 16 + PostGIS 3.4 Database     │
│  - EPSG:4326 (WGS 84) Coordinate Reference    │
│  - GIST Indexing (`atm_location_geom_idx`)    │
└───────────────────────────────────────────────┘
```

---

## 🎛️ Comprehensive Menu Items & Feature Breakdown

### 1. Home Dashboard (`/` ➔ `Home Dashboard`)
- **Key Features**:
  - **4 Live Metric Stat Cards**: Total NCRP Complaints, Flagged Financial Loss (₹), Active Threat Alerts Count, and PostGIS Mean Spatial Accuracy (in meters).
  - **Live Ingestion Complaints Table**: View latest complaints with loss amounts, PostGIS coordinates, crime categories, and quick `Forecast` navigation buttons.
  - **PostGIS Spatial Hot-Spots Overview**: Summary table of top spatial cybercrime hubs (Jamtara, Mewat, Delhi NCR, etc.) with quick link to thermal heatmaps.
  - **Intelligence Alerts Feed Widget**: High-priority alert list with one-click **Dispatch Field Unit** and **Notify Bank Nodal** action buttons.
  - **Architecture Stack Health Widget**: Real-time status check of Backend API, ML Engine, PostgreSQL/PostGIS, and Next.js Frontend.

### 2. System Flowchart (PPT) (`/` ➔ `System Flowchart (PPT)`)
- **Key Features**:
  - **Interactive 6-Stage Process Flowchart**: Visually maps the workflow from **NCRP Complaint Logging ➔ Feature Extraction ➔ PostGIS Querying ➔ Dual ML Scoring ➔ AI Red-Team Verification ➔ Field Interception**.
  - **Detailed Subsystem Technical Specs**: Displays Latency SLAs (<150ms total scoring budget), DB Schema rules, and API endpoints for each stage.

### 3. Spatial Hotspots Map (`/` ➔ `Spatial Hotspots Map`)
- **Key Features**:
  - **Interactive Spatial Thermal Heatmap**: Leaflet map visualizing crime origin hotspots and ATM candidate clusters.
  - **Regional Hub Selector**: Switch between Delhi NCR, Jamtara/Deoghar, Mewat Region, Mumbai Metro, Bengaluru Tech, and Hyderabad.
  - **DBSCAN Cluster Filters**: Toggle between Critical Threat, High Risk, and Moderate Risk spatial points.
  - **ATM Marker Details Popup**: Displays ATM ID, Bank Name, exact latitude/longitude, distance offset, and estimated cash-out probability.

### 4. ML ATM Predictions (`/` ➔ `ML ATM Predictions`)
- **Key Features**:
  - **4-Core Forecast Matrix**:
    1. **WHERE**: Target ATM Bank Name, Address, City, Distance offset (km), and EPSG:4326 Coordinates.
    2. **WHEN**: Predicted time window (e.g. *1.18 - 3.68 Hours Post-Incident*) and Probability Density Fit %.
    3. **WHY**: SHAP Feature Drivers (+24.5% Historical ATM Frequency, +18.2% Transaction Velocity, etc.).
    4. **CONFIDENCE**: Overall statistical certainty index (%) and operational risk score.
  - **AI Red-Team Audit Panel**: Shows supporting vs. contradicting signals, data quality completeness rating, and reasons why prediction may be wrong.
  - **Synthetic Complaint Selector**: Switch predictions dynamically across different complaint Ack IDs.

### 5. NCRP Complaints Log (`/` ➔ `NCRP Complaints Log`)
- **Key Features**:
  - **Case Deep-Dive Inspection**: Full profile of selected NCRP complaint (Ack ID, Loss Amount, Crime Category, Victim Account Number, Incident Timestamp).
  - **Multi-Hop Fund Transfer Network Table**: Displays step-by-step transaction trail (Hop #1 Victim ➔ Mule L1, Hop #2 Mule L1 ➔ Mule L2, Hop #3 Mule L2 ➔ Target ATM).

### 6. Financial Trail Graph (`/` ➔ `Financial Trail Graph`)
- **Key Features**:
  - **Neo4j Graph Relationship Query Engine**: Query financial networks across 8 node types (`Complaint`, `Victim`, `Account`, `Device`, `UpiId`, `ATM`, `Location`) and 6 relationship types (`REPORTED_IN`, `TRANSFERRED_TO`, `WITHDRAWN_AT`, `USED`, `CONNECTED_TO`).
  - **Graph Derived Risk Analytics**: Displays account degree (in/out degree), transaction path depth, connected victim count, and neutral suspicious cluster indicators.

### 7. Counterfactual Studio (`/` ➔ `Counterfactual Studio`)
- **Key Features**:
  - **What-If Scenario Simulator**: Test hypothetical transaction changes without modifying live databases.
  - **Hypothetical Controls**: Modify additional transfer amounts (+₹10,000 to +₹5,00,000) and extra transfer hops (+1 or +2 hops).
  - **Risk Delta Comparison**: Compare Baseline Risk Score vs. Simulated Risk Score, score shift delta (%), and time window shift.

### 8. Operational Alerts Feed (`/` ➔ `Operational Alerts Feed`)
- **Key Features**:
  - **Real-Time Dispatch Queue**: Priority queue filtered by severity (`CRITICAL`, `HIGH`, `ALL`).
  - **Action Dispatch Buttons**:
    - **Dispatch Field Unit**: Triggers dispatch status for law enforcement patrolling near the target ATM.
    - **Notify Bank Nodal**: Triggers automated notification to bank nodal officers for CCTV surveillance / card lock.
    - **Suppress Alert**: Temporarily suppresses false-positive alerts.

### 9. Evidence Audit Log (`/` ➔ `Evidence Audit Log`)
- **Key Features**:
  - **Adversarial Audit Matrix**: Data Completeness Score (%), Audited Final Confidence (%), and Alert Decision (`MAINTAIN_ALERT` vs `DOWNGRADED`).
  - **Missing Data Field Detection**: Highlights unverified parameters (e.g. missing victim device IMEI, unverified mule KYC).
  - **Supporting vs. Contradicting Signal Breakdown**: Clear breakdown of signals supporting or challenging the prediction.

### 10. ML Engine Performance (`/` ➔ `ML Engine Performance`)
- **Key Features**:
  - **Validation Metrics**: Precision@K=5 Location (88.4%), Mean Distance Error (1.42 km), Mean Time Window Error (0.65 hrs / 39 mins), and Temporal PDF Fit (91.2%).
  - **PostGIS Database Status**: Verifies PostGIS 3.4 status, GIST Index (`atm_location_geom_idx`), and EPSG:4326 CRS status.
  - **Neo4j Graph Status**: Verifies driver protocol (`bolt://localhost:7687`) and fallback engine state.
  - **Auditable Fusion Weight Specification Table**: Full mathematical specification of all 6 risk fusion components.

### 11. Dedicated 3D Map Studio (`/map`)
- **Key Features**:
  - **Full-Screen Tactical Geospatial Studio**: Full-page interactive map view dedicated to spatial tactical planning and regional node inspection.

---

## 🧮 Algorithmic & Mathematical Models (Comprehensive Hindi & English Explanation)

### 1. Spatial Candidate Likelihood Model (WHERE Algorithm)
**Formula**:
$$P_{\text{loc}}(i) = \exp(-\gamma \cdot d_i) \cdot \left(1 + \beta \cdot \text{Density}_{\text{DBSCAN}}(i)\right)$$

- $\gamma = 0.20$ (Distance Decay Rate)
- $\beta = 0.15$ (DBSCAN Cluster Boost Factor)

**Simple Explanation (Aap Kisi Ko Bhi Aise Samjha Sakte Hain)**:
> *"Yeh algorithm decide karta hai ki fraud hone ke baad fraudster **KIS ATM** se cash nikalne wala hai. Iske 2 mukhya niyam hain:"*
> 1. **Distance Decay (Doori Niyam)**: Crime spot ya complaint origin se ATM jitna door hoga, wahan cash nikalne ki sambhavna utni kam hoti jayegi ($\exp(-\gamma \cdot d)$).
> 2. **DBSCAN Spatial Cluster Boost**: Agar koi ATM aisi jagah hai jahan aas-paas pehle se bohot saare criminal cash-out incidents aur ATMs ka cluster hai, toh us ATM ka risk score badh jata hai.
>
> **Real-World Example**: Agar Connaught Place (Delhi) mein complaint hui hai, toh 1.5 km door wala PNB ATM 12 km door wale ATM se 10x zyada high priority par hoga.

---

### 2. Temporal Time-Lag PDF Model (WHEN Algorithm)
**Formula**:
$$f(t) = \lambda \cdot \exp(-\lambda \cdot (t - t_0)) \quad \text{for } t \ge t_0$$

- $\lambda = 0.35$ (Time Decay Parameter)
- $t_0$ = Incident Reported Time

**Simple Explanation**:
> *"Yeh algorithm bataata hai ki **KAB** (kis exact time window mein) cash withdrawal hoga:"*
> - Fraudster ke paas bank account block hone se pehle paisa nikalne ka ek chhota aur urgent time window hota hai.
> - Exponential PDF curve calculate karta hai ki victim ke complaint log hone ke **1.5 se 3.5 ghante ke andar** cash out hone ki 90%+ probability hoti hai.
>
> **Real-World Example**: Agar raat ko 1:00 AM par fraud hua hai, toh algorithm Police ko alert bhejega ki *1:45 AM se 4:00 AM* ke beech target ATM par team dispatch karein.

---

### 3. Auditable 6-Component Risk Fusion Formula
**Formula**:
$$R_{\text{ops}} = 0.25 S_{\text{spatial}} + 0.20 S_{\text{temporal}} + 0.15 S_{\text{historical}} + 0.15 S_{\text{geospatial}} + 0.15 S_{\text{transaction}} + 0.10 S_{\text{graph}}$$

**Simple Explanation**:
> *"System kisi 1 signal par andha vishwas nahi karta. 6 alag-alag intelligence factors ko weightage dekar 0–100 ka final Operational Risk Score banaya jata hai:"*
> 
> | Weight | Component | Simple Meaning |
> | :--- | :--- | :--- |
> | **25%** | $S_{\text{spatial}}$ | ATM ki crime location se doori (Distance Fit) |
> | **20%** | $S_{\text{temporal}}$ | Expected time window ke sath alignment (Timing Fit) |
> | **15%** | $S_{\text{historical}}$ | Us ATM par past mein fraud cash-outs ki frequency |
> | **15%** | $S_{\text{geospatial}}$ | Area ka DBSCAN cluster density score |
> | **15%** | $S_{\text{transaction}}$ | Loss Amount ($₹$) aur transfer speed (Velocity) |
> | **10%** | $S_{\text{graph}}$ | Mule accounts ki layering depth aur fan-in degree |

---

### 4. AI Red-Team Adversarial Audit Engine
**Simple Explanation**:
> *"Yeh system ka **'Devil's Advocate' (Cross-Verification Engine)** hai jo har prediction ko challenge karta hai:"*
> - **Kyon zaroori hai?**: Taaki false alerts se Police ka kimti time waste na ho.
> - **Kaise kaam karta hai?**: Agar AI model ne 85% score diya hai, lekin Complaint mein IMEI fingerprint missing hai ya Mule Account ka KYC doubtful hai, toh Red-Team Audit alert ko **DOWNGRADE** kar deta hai aur report mein reason deta hai ki prediction galat kyon ho sakti hai.

---

## 🔌 API Endpoints Catalog

| Service | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Backend** | `GET` | `/api/v1/health` | Backend status & system timestamp |
| **Backend DB** | `GET` | `/api/v1/health/db` | PostgreSQL & PostGIS version & index health check |
| **Backend** | `GET` | `/api/v1/synthetic/complaints` | Fetch synthetic NCRP complaints list |
| **Backend** | `GET` | `/api/v1/synthetic/graph/complaint/{ack_id}` | Fetch multi-hop graph edges for a complaint |
| **Backend** | `GET` | `/api/v1/synthetic/graph/account/{acc}` | Fetch graph degree & analytics for a mule account |
| **Backend** | `POST` | `/api/v1/simulation/counterfactual` | Execute in-memory what-if scenario simulation |
| **ML Service** | `GET` | `/api/v1/health` | ML pipeline status & algorithms list |
| **ML Service** | `POST` | `/api/v1/predictions/forecast` | Execute dual spatial-temporal ML forecast |

---

## 🛡️ Security, Privacy & Synthetic Data Guardrails

> [!IMPORTANT]
> **Synthetic Data Compliance Guardrail**:
> All spatial coordinates, complaint Ack IDs, victim names, transaction amounts, and ATM node locations in this application are generated synthetically using probabilistic random distributions. This prototype does **NOT** contain, process, or store real Personally Identifiable Information (PII) or confidential NCRP / Bank records.
