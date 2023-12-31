const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");
const chunkPathBasic = require.resolve("./entries/basic.mjs");
const chunkPathDevServer = require.resolve("./entries/devserver.mjs");
class ErrorOverlayPlugin {
  apply(compiler) {
    var _a, _b, _c, _d, _e, _f, _g;
    const className = this.constructor.name;
    if (compiler.options.mode !== "development")
      return;
    const devServerEnabled = !!compiler.options.devServer;
    const sockOptions = {};
    if (devServerEnabled) {
      sockOptions.sockHost = ((_b = (_a = compiler.options.devServer.client) == null ? void 0 : _a.webSocketURL) == null ? void 0 : _b.hostname) || compiler.options.devServer.host;
      sockOptions.sockPath = ((_d = (_c = compiler.options.devServer.client) == null ? void 0 : _c.webSocketURL) == null ? void 0 : _d.pathname) || compiler.options.devServer.webSocketServer === "object" && ((_e = compiler.options.devServer.webSocketServer.options) == null ? void 0 : _e.path) || "/ws";
      sockOptions.sockPort = ((_g = (_f = compiler.options.devServer.client) == null ? void 0 : _f.webSocketURL) == null ? void 0 : _g.port) || compiler.options.devServer.port;
    }
    compiler.hooks.entryOption.tap(className, (context, entry) => {
      adjustEntry(entry, devServerEnabled, sockOptions);
    });
    compiler.hooks.afterResolvers.tap(className, ({ options }) => {
      if (devServerEnabled) {
        const originalOnBeforeSetupMiddleware = options.devServer.onBeforeSetupMiddleware;
        options.devServer.setupMiddlewares = (middlewares, devServer) => {
          if (originalOnBeforeSetupMiddleware) {
            originalOnBeforeSetupMiddleware(devServer);
          }
          middlewares.unshift(errorOverlayMiddleware());
          return middlewares;
        };
      }
    });
  }
}
function adjustEntry(entry, enableDevServer, sockOptions) {
  if (typeof entry === "string") {
    entry = [entry];
  }
  if (Array.isArray(entry)) {
    if (enableDevServer) {
      const sockHost = sockOptions.sockHost ? `&sockHost=${sockOptions.sockHost}` : "";
      const sockPath = sockOptions.sockPath ? `&sockPath=${sockOptions.sockPath}` : "";
      const sockPort = sockOptions.sockPort ? `&sockPort=${sockOptions.sockPort}` : "";
      const chunkPathDevServerWithParams = `${chunkPathDevServer}?${sockHost}${sockPath}${sockPort}`;
      if (!entry.includes(chunkPathDevServerWithParams)) {
        entry.unshift(chunkPathDevServerWithParams);
      }
    }
    if (!entry.includes(chunkPathBasic)) {
      entry.unshift(chunkPathBasic);
    }
  } else {
    Object.keys(entry).forEach((entryName) => {
      entry[entryName] = adjustEntry(
        entry[entryName],
        enableDevServer,
        sockOptions
      );
    });
  }
  return entry;
}

export { ErrorOverlayPlugin };
//# sourceMappingURL=index.mjs.map
