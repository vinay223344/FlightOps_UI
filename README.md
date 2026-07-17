# FlightOps UI

Production-ready React + TypeScript frontend for **FlightOps**, a role-based
Airport Ground Operations Management System. It talks to the Spring Boot backend
(`FlightOps_Team`) on `http://localhost:8080`.

## Tech stack

- React 18 + TypeScript (strict mode)
- Vite (dev server + build)
- React Router v6
- React-Bootstrap 5 + Bootstrap 5
- Context API — `AuthContext`, `NotificationContext`, `ToastContext`
- Axios with a JWT request interceptor + transparent refresh-on-401
- Recharts (analytics), react-hot-toast (toasts), date-fns (dates),
  @tabler/icons-react (icons)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173  (proxies /api → http://localhost:8080)
npm run build    # type-check + production build
npm run preview  # preview the production build
```

Start the backend first (`FlightOps_Team`) so `:8080` is reachable. The Vite dev
server proxies every `/api/*` request to it, so no CORS setup is needed.

### Demo logins (password `Password@123`)

| Role | Email |
|------|-------|
| Admin | admin@flightops.in |
| Ground Supervisor | arjun.verma@blrops.in |
| Airline Coordinator | priya.nair@airindia.in |
| GSE Manager | suresh.babu@blrops.in |
| Passenger Agent | sneha.das@blrops.in |
| Ramp Officer | vijay.kumar@blrops.in |

## Architecture

```
src/
  api/          one module per backend controller (typed, unwraps ApiResponse)
  types/        enums (union types + value arrays), DTOs, request/auth types
  services/     storageService (session/local token persistence)
  context/      AuthContext, NotificationContext (30s poll), ToastContext
  hooks/        one data hook per domain + useAsyncData, usePageTitle, useConfirm
  utils/        token, date, format, error, role, statusColor helpers
  constants/    badge colour map, SLA schedule, service types, nav config
  routes/       AppRouter, PrivateRoute (→/login), RoleRoute (→/not-authorized)
  layouts/      AppShell (navbar + sidebar) + one thin layout per role
  components/    common/ (reusable) + flight/ + turnaround/ + notifications/
  pages/        one folder per role, one file per screen
```

### Auth flow

1. Login stores the access token in `sessionStorage`, refresh token + user in
   `localStorage`.
2. The axios request interceptor attaches `Authorization: Bearer <accessToken>`.
3. On a `401`, the response interceptor calls `/api/auth/refresh` (which returns
   a **raw** token object, not the `ApiResponse` envelope), stores the new access
   token and replays the original request. Concurrent 401s share one refresh.
4. If refresh fails, the session is cleared and the app returns to `/login`.
5. On startup the app rehydrates from the stored tokens.

### Role → route map

| Role | Base route |
|------|-----------|
| Admin | `/admin` |
| AirlineCoordinator | `/coordinator` |
| GroundSupervisor | `/supervisor` |
| GSEManager | `/gse` |
| PassengerAgent | `/passenger` |
| RampOfficer | `/ramp` |
