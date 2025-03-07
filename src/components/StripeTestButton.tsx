import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function StripeTestButton() {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testStripeConfig = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/stripe/test", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      console.log("Stripe test response:", response.data);
      setTestResult(response.data);
      toast.success("Stripe configuration test completed");
    } catch (error) {
      console.error("Stripe test error:", error);
      if (axios.isAxiosError(error)) {
        setTestResult({
          error: true,
          message: error.message,
          response: error.response?.data,
        });
      } else {
        setTestResult({
          error: true,
          message: "Unknown error",
        });
      }
      toast.error("Stripe configuration test failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#1A1A1A] rounded-xl border border-white/10 mb-4">
      <h3 className="text-lg font-medium text-white mb-4">
        Stripe Configuration Test
      </h3>

      <button
        onClick={testStripeConfig}
        className="bg-[#CDFF63] text-black font-medium py-2 px-4 rounded-lg hover:bg-[#CDFF63]/90 transition-colors mb-4"
        disabled={isLoading}
      >
        {isLoading ? "Testing..." : "Test Stripe Configuration"}
      </button>

      {testResult && (
        <div className="mt-4 p-3 bg-black/30 border border-white/10 rounded-lg">
          <pre className="text-xs text-white/80 overflow-auto max-h-40">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
