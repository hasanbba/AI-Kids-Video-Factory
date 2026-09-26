# Python media workers

The worker service is a separate process boundary for GPU and CPU intensive work. Laravel owns workflow state and dispatches durable queue jobs; workers should receive idempotent task identifiers and report status through a private authenticated API or a future event channel. Keep worker credentials out of the Vue application. ComfyUI and FFmpeg binaries are configured through Laravel service settings and should be invoked only by the worker runtime.

No business tasks or worker API are implemented in this foundation.
