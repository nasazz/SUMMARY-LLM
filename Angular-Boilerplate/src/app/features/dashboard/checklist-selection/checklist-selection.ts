import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { API_CONFIG } from '../../../core/config/api.config';

// ── Domain Types ──────────────────────────────────────────────────────────────
type JobStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

interface UploadResponse {
  tracking_id: string;
  message: string;
}

interface DocumentAnalysis {
  summary: string;
  extracted_keywords: string[];
  confidence_score: number;
  llm_token_usage: number;
}

interface DocumentResponse {
  id: string;
  file_name: string;
  job_status: JobStatus;
  uploaded_at: string;
  completed_at?: string;
  error_message?: string;
  analysis?: DocumentAnalysis;
}

interface UploadJob {
  trackingId: string;
  fileName: string;
  status: JobStatus;
  uploadedAt: Date;
  analysis?: DocumentAnalysis;
  error?: string;
  pollInterval?: ReturnType<typeof setInterval>;
}

@Component({
  selector: 'app-checklist-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checklist-selection.html',
})
export class ChecklistSelectionComponent {
  private http = inject(HttpClient);
  private apiBase = `${API_CONFIG.baseUrl}/documents`;

  // ── State ──────────────────────────────────────────────────────────────────
  isDragging = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  errorMessage = signal<string | null>(null);
  jobs = signal<UploadJob[]>([]);
  selectedJob = signal<UploadJob | null>(null);

  completedCount = computed(() => this.jobs().filter(j => j.status === 'Completed').length);
  processingCount = computed(() => this.jobs().filter(j => j.status === 'Processing' || j.status === 'Pending').length);

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) this.handleFile(files[0]);
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
      input.value = ''; // reset so same file can be re-selected
    }
  }

  // ── Upload Logic ───────────────────────────────────────────────────────────
  handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are supported.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    this.http.post<UploadResponse>(`${this.apiBase}/`, formData, {
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event) => {
        this.errorMessage.set(null);
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event.type === HttpEventType.Response) {
          const body = event.body!;
          const job: UploadJob = {
            trackingId: body.tracking_id,
            fileName: file.name,
            status: 'Pending',
            uploadedAt: new Date(),
          };
          this.jobs.update(j => [job, ...j]);
          this.isUploading.set(false);
          this.uploadProgress.set(0);
          this.startPolling(job);
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        const msg = err.error?.detail || 'Upload failed. Ensure the Message Broker (Redis) is running.';
        this.errorMessage.set(msg);
        this.isUploading.set(false);
        this.uploadProgress.set(0);
      }
    });
  }

  // ── Polling ────────────────────────────────────────────────────────────────
  startPolling(job: UploadJob) {
    const interval = setInterval(() => {
      this.http.get<DocumentResponse>(`${this.apiBase}/${job.trackingId}`).subscribe({
        next: (doc) => {
          this.jobs.update(jobs =>
            jobs.map(j => j.trackingId === job.trackingId
              ? {
                  ...j,
                  status: doc.job_status,
                  analysis: doc.analysis,
                  error: doc.error_message,
                }
              : j
            )
          );
          if (doc.job_status === 'Completed' || doc.job_status === 'Failed') {
            clearInterval(interval);
            // Refresh selected panel if it's this job
            if (this.selectedJob()?.trackingId === job.trackingId) {
              const updated = this.jobs().find(j => j.trackingId === job.trackingId);
              if (updated) this.selectedJob.set(updated);
            }
          }
        },
        error: () => clearInterval(interval)
      });
    }, 3000);

    // Store interval reference for cleanup
    job.pollInterval = interval;
  }

  // ── UI Helpers ─────────────────────────────────────────────────────────────
  openDetail(job: UploadJob) {
    this.selectedJob.set(job);
  }

  closeDetail() {
    this.selectedJob.set(null);
  }

  statusColor(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      Pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      Processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      Completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      Failed: 'text-red-400 bg-red-400/10 border-red-400/20',
    };
    return map[status];
  }

  statusIcon(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      Pending: 'pi-clock',
      Processing: 'pi-spin pi-spinner',
      Completed: 'pi-check-circle',
      Failed: 'pi-times-circle',
    };
    return map[status];
  }

  formatDate(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  confidencePercent(score: number) {
    return Math.round(score * 100);
  }
}
