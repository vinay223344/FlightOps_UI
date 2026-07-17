import api from './axiosInstance';
import type {
  ApiResponse,
  DashboardMetricsResponse,
  GroundOpsReportResponse,
  ReportGenerateRequest,
  ReportMetricsMap,
} from '../types';

export const analyticsApi = {
  async dashboard(): Promise<DashboardMetricsResponse> {
    const res = await api.get<ApiResponse<DashboardMetricsResponse>>(
      '/api/metrics/dashboard',
    );
    return res.data.data;
  },

  async onTimeRate(): Promise<ReportMetricsMap> {
    const res = await api.get<ApiResponse<ReportMetricsMap>>(
      '/api/metrics/on-time-rate',
    );
    return res.data.data;
  },

  async turnaroundReport(): Promise<ReportMetricsMap> {
    const res =
      await api.get<ApiResponse<ReportMetricsMap>>('/api/reports/turnaround');
    return res.data.data;
  },

  async gseUtilisationReport(): Promise<ReportMetricsMap> {
    const res = await api.get<ApiResponse<ReportMetricsMap>>(
      '/api/reports/gse-utilisation',
    );
    return res.data.data;
  },

  async baggageReport(): Promise<ReportMetricsMap> {
    const res =
      await api.get<ApiResponse<ReportMetricsMap>>('/api/reports/baggage');
    return res.data.data;
  },

  async slaBreachesReport(): Promise<ReportMetricsMap> {
    const res = await api.get<ApiResponse<ReportMetricsMap>>(
      '/api/reports/sla-breaches',
    );
    return res.data.data;
  },

  async listReports(): Promise<GroundOpsReportResponse[]> {
    const res =
      await api.get<ApiResponse<GroundOpsReportResponse[]>>('/api/reports');
    return res.data.data;
  },

  async generateReport(
    payload: ReportGenerateRequest,
  ): Promise<GroundOpsReportResponse> {
    const res = await api.post<ApiResponse<GroundOpsReportResponse>>(
      '/api/reports/generate',
      payload,
    );
    return res.data.data;
  },
};
