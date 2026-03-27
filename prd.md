Product Requirements Document (PRD) - MVP Phase
Objective: Build an asynchronous microservice that accepts document uploads, processes them in the background to prevent HTTP timeouts, and uses an LLM to extract key entities and generate a summary.

Async Document Processing Pipeline
FastAPI is the industry standard for wrapping Python's rich data science and AI ecosystem.

The Pitch: A microservice where clients upload large files (e.g., PDFs, financial reports), which are then asynchronously processed, parsed, and summarized using an LLM.

Tech Stack: FastAPI, Celery (for task queuing), Redis (message broker), PostgreSQL, and structlog for structured logging.

Why it stands out: It demonstrates you can handle long-running processes without blocking the main event loop. You will prove you can manage distributed system state, queuing, and third-party API rate limiting.

Core User Flows:

Submission: Client submits a PDF document. The API instantly returns a 202 Accepted status and a TrackingId.
Background Processing: A Celery worker picks up the task, extracts text, calls the LLM, and updates the database.
Polling/Retrieval: Client queries the API using the TrackingId to check the status (Pending, Processing, Completed, Failed) and retrieves the final AI analysis once done.
Technical Constraints (Strict N-Layer):

Presentation: FastAPI routers handle HTTP requests and responses only.
Logic: Services manage the Celery task dispatch and LLM orchestration.
Data: SQLAlchemy (or raw PyODBC) with the Repository pattern over SQL Server.

4. Database Prototype (SQL Server)
Since we are targeting SQL Server, we need a relational structure that tracks the state of asynchronous jobs cleanly.

SQL

-- 1. Documents Table: Tracks the file and the async job status
CREATE TABLE Documents (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FileName NVARCHAR(255) NOT NULL,
    StoragePath NVARCHAR(1000) NOT NULL,
    FileSizeKb INT NOT NULL,
    JobStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Processing, Completed, Failed
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL,
    ErrorMessage NVARCHAR(MAX) NULL
);

-- 2. DocumentAnalyses Table: Stores the structured AI output
CREATE TABLE DocumentAnalyses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    DocumentId UNIQUEIDENTIFIER NOT NULL UNIQUE,
    Summary NVARCHAR(MAX) NOT NULL,
    ExtractedKeywords NVARCHAR(MAX) NOT NULL, -- Stored as JSON array string
    ConfidenceScore DECIMAL(5, 2) NULL,
    LlmTokenUsage INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_DocumentAnalyses_Documents FOREIGN KEY (DocumentId) 
        REFERENCES Documents(Id) ON DELETE CASCADE
);

