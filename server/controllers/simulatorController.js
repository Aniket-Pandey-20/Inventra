import { runTransactionSimulation } from "../kafka/kafkaSimutationScript.js";

export async function simulateTransactions(req, res) {
  try {
    const events = await runTransactionSimulation();

    res.json({
      success: true,
      message: "Simulation triggered successfully",
      totalEvents: events.length,
      events,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
