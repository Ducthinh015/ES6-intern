// B5: Internal Architecture Flow & Router Simulator

class FlowRouterSimulator {
  constructor(routes = []) {
    this.routes = routes;
    this.currentRoute = null;
    this.authState = { isAuthenticated: true, userRole: 'ADMIN' };
  }

  navigate(path) {
    console.log(`\n[Router] 🚀 Navigating to path: "${path}"`);

    // Step 1: Match Path
    const match = this.routes.find(r => r.path === path);
    if (!match) {
      console.log(`[Router] ❌ 404 Not Found: No component matched for "${path}"`);
      return { status: 404, message: 'Page Not Found' };
    }

    // Step 2: Auth Check
    if (match.authRequired && !this.authState.isAuthenticated) {
      console.log(`[Router] 🔒 Auth Guard: Redirecting to /login`);
      return this.navigate('/login');
    }

    // Step 3: Role Check
    if (match.roles && !match.roles.includes(this.authState.userRole)) {
      console.log(`[Router] 🚫 Forbidden: User role "${this.authState.userRole}" lacks permissions.`);
      return { status: 403, message: 'Access Denied' };
    }

    this.currentRoute = match;
    console.log(`[Router] ✅ Successfully rendered Component: <${match.component} />`);
    return { status: 200, component: match.component };
  }

  simulateApiFetch(endpoint) {
    console.log(`[DataLayer] 🌐 Axios Request: GET ${endpoint}`);
    console.log(`[Interceptor] 🔑 Attached Bearer Token: "eyJhbGciOiJIUzI1Ni..."`);
    return {
      status: 200,
      data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    };
  }
}

// Example execution if run directly via Node
if (typeof require !== 'undefined' && require.main === module) {
  const arcMap = require('./architecture_map.json');
  const sim = new FlowRouterSimulator(arcMap.routes);
  
  sim.navigate('/users');
  sim.simulateApiFetch('/api/v1/users');
}

if (typeof module !== 'undefined') {
  module.exports = { FlowRouterSimulator };
}
