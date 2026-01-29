import { describe, it, expect } from "vitest";
import {
  classifyError,
  TransientDatabaseError,
  PermanentDatabaseError,
  DatabaseError,
} from "./errors";

describe("classifyError", () => {
  describe("retryable errors (transient)", () => {
    it.each([
      ["CONNECT_TIMEOUT", "Connection timed out"],
      ["ECONNREFUSED", "Connection refused"],
      ["ECONNRESET", "Connection reset"],
      ["ETIMEDOUT", "Connection timed out"],
      ["08000", "PostgreSQL connection exception"],
      ["08003", "PostgreSQL connection does not exist"],
      ["08006", "PostgreSQL connection failure"],
      ["57P01", "PostgreSQL admin shutdown"],
      ["57P02", "PostgreSQL crash shutdown"],
      ["57P03", "PostgreSQL cannot connect now"],
    ])("classifies %s as TransientDatabaseError", (code, message) => {
      const error = { code, message };
      const result = classifyError(error);

      expect(result).toBeInstanceOf(TransientDatabaseError);
      expect(result.code).toBe(code);
      expect(result.isRetryable).toBe(true);
    });
  });

  describe("non-retryable errors (permanent)", () => {
    it.each([
      ["23505", "Unique constraint violation"],
      ["23503", "Foreign key violation"],
      ["42601", "Syntax error"],
      ["42P01", "Undefined table"],
      ["ENOTFOUND", "DNS lookup failure"],
    ])("classifies %s as PermanentDatabaseError", (code, message) => {
      const error = { code, message };
      const result = classifyError(error);

      expect(result).toBeInstanceOf(PermanentDatabaseError);
      expect(result.code).toBe(code);
      expect(result.isRetryable).toBe(false);
    });
  });

  describe("nested cause chain handling", () => {
    it("finds retryable code in nested cause (1 level deep)", () => {
      const error = {
        message: "Failed query",
        cause: {
          code: "ECONNREFUSED",
          message: "connect ECONNREFUSED",
        },
      };
      const result = classifyError(error);

      expect(result).toBeInstanceOf(TransientDatabaseError);
      expect(result.code).toBe("ECONNREFUSED");
      expect(result.isRetryable).toBe(true);
    });

    it("finds retryable code in nested cause (2 levels deep)", () => {
      const error = {
        message: "Failed query: select...",
        cause: {
          message: "Connection error",
          cause: {
            code: "ETIMEDOUT",
            message: "Connection timed out",
          },
        },
      };
      const result = classifyError(error);

      expect(result).toBeInstanceOf(TransientDatabaseError);
      expect(result.code).toBe("ETIMEDOUT");
      expect(result.isRetryable).toBe(true);
    });

    it("finds non-retryable code in nested cause", () => {
      const error = {
        message: "Failed query",
        cause: {
          message: "Constraint violation",
          cause: {
            code: "23505",
            message: "duplicate key value",
          },
        },
      };
      const result = classifyError(error);

      expect(result).toBeInstanceOf(PermanentDatabaseError);
      expect(result.code).toBe("23505");
      expect(result.isRetryable).toBe(false);
    });

    it("uses top-level message even when code is from nested cause", () => {
      const error = {
        message: "Failed query: select * from users",
        cause: {
          cause: {
            code: "ECONNREFUSED",
            message: "connect ECONNREFUSED 127.0.0.1:5432",
          },
        },
      };
      const result = classifyError(error);

      expect(result.message).toBe("Failed query: select * from users");
      expect(result.code).toBe("ECONNREFUSED");
    });
  });

  describe("edge cases", () => {
    it("handles standard Error objects", () => {
      const error = new Error("Something went wrong");
      const result = classifyError(error);

      expect(result).toBeInstanceOf(PermanentDatabaseError);
      expect(result.message).toBe("Something went wrong");
      expect(result.isRetryable).toBe(false);
    });

    it("handles unknown error types", () => {
      const result = classifyError("string error");

      expect(result).toBeInstanceOf(PermanentDatabaseError);
      expect(result.message).toBe("Unknown database error");
      expect(result.isRetryable).toBe(false);
    });

    it("handles null", () => {
      const result = classifyError(null);

      expect(result).toBeInstanceOf(PermanentDatabaseError);
      expect(result.isRetryable).toBe(false);
    });

    it("handles undefined", () => {
      const result = classifyError(undefined);

      expect(result).toBeInstanceOf(PermanentDatabaseError);
      expect(result.isRetryable).toBe(false);
    });

    it("preserves original error as cause", () => {
      const originalError = { code: "ECONNREFUSED", message: "Connection refused" };
      const result = classifyError(originalError);

      expect(result.cause).toBe(originalError);
    });
  });
});

describe("DatabaseError", () => {
  it("is the base class for TransientDatabaseError", () => {
    const error = new TransientDatabaseError("test", "CODE");
    expect(error).toBeInstanceOf(DatabaseError);
    expect(error).toBeInstanceOf(Error);
  });

  it("is the base class for PermanentDatabaseError", () => {
    const error = new PermanentDatabaseError("test");
    expect(error).toBeInstanceOf(DatabaseError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("TransientDatabaseError", () => {
  it("has correct name property", () => {
    const error = new TransientDatabaseError("message", "CODE");
    expect(error.name).toBe("TransientDatabaseError");
  });

  it("isRetryable is always true", () => {
    const error = new TransientDatabaseError("message", "CODE");
    expect(error.isRetryable).toBe(true);
  });
});

describe("PermanentDatabaseError", () => {
  it("has correct name property", () => {
    const error = new PermanentDatabaseError("message");
    expect(error.name).toBe("PermanentDatabaseError");
  });

  it("isRetryable is always false", () => {
    const error = new PermanentDatabaseError("message");
    expect(error.isRetryable).toBe(false);
  });

  it("code is optional", () => {
    const withCode = new PermanentDatabaseError("message", "23505");
    const withoutCode = new PermanentDatabaseError("message");

    expect(withCode.code).toBe("23505");
    expect(withoutCode.code).toBeUndefined();
  });
});
