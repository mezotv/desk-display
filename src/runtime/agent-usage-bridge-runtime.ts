import { Layer, ManagedRuntime } from "effect";

export const agentUsageBridgeRuntime = ManagedRuntime.make(Layer.empty);

const disposeAgentUsageBridgeRuntime = () => {
  void agentUsageBridgeRuntime.dispose();
};

process.once("SIGINT", disposeAgentUsageBridgeRuntime);
process.once("SIGTERM", disposeAgentUsageBridgeRuntime);
