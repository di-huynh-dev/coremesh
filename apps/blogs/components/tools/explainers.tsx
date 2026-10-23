// Ported from The DevOps Daily (MIT, commit 9980950): https://github.com/The-DevOps-Daily/devops-daily
// See components/tools/LICENSE.

// Explainer copy shown under each tool (English, from the original tool pages).

export function Base64Explainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">When you&apos;ll reach for this</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-sm">Kubernetes Secrets</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kubernetes stores Secret data as base64. Encoding a token or password here gives you
            the value that goes into <code className="font-mono">data:</code> in a Secret manifest.
            Remember: base64 is encoding, not encryption. Your secrets aren&apos;t secret yet.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-sm">API debugging</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            HTTP Basic auth, SAML responses, OAuth state parameters, signed URLs — lots of
            day-to-day DevOps work involves URL encoding or base64. Paste, inspect, move on.
          </p>
        </div>
      </div>
    </>
  );
}

export function CidrCalculatorExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">How CIDR works</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-sm">Prefix length</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The number after the slash is the prefix length. It tells you how many bits of the
            address are the network portion. <code className="font-mono">/24</code> means the
            first 24 bits are the network, leaving 8 bits (256 addresses) for hosts.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-sm">Usable vs total</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every normal subnet reserves the first address for the network identifier and the last
            for broadcast. Usable hosts = total addresses minus 2. Point-to-point links
            (<code className="font-mono">/31</code>) and host routes (<code className="font-mono">/32</code>) are the exceptions.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
        <h4 className="mb-2 font-semibold text-sm">Common prefixes</h4>
        <ul className="space-y-1 text-sm text-muted-foreground font-mono tabular-nums">
          <li>
            <strong className="text-foreground">/32</strong>: a single host (1 address)
          </li>
          <li>
            <strong className="text-foreground">/30</strong>: 4 addresses, 2 usable (point-to-point link)
          </li>
          <li>
            <strong className="text-foreground">/24</strong>: 256 addresses, 254 usable (classic LAN)
          </li>
          <li>
            <strong className="text-foreground">/16</strong>: 65,536 addresses (AWS VPC default)
          </li>
          <li>
            <strong className="text-foreground">/8</strong>: 16,777,216 addresses (one of the old class-A ranges)
          </li>
        </ul>
      </div>
    </>
  );
}

export function CronParserExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">Cron syntax cheat sheet</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-sm">Five fields, in order</h4>
          <pre className="font-mono text-xs bg-muted/40 rounded-md p-3 leading-relaxed">
            {`* * * * *
┬ ┬ ┬ ┬ ┬
│ │ │ │ └─ day of week (0-7, Sun=0 and 7)
│ │ │ └─── month (1-12)
│ │ └───── day of month (1-31)
│ └─────── hour (0-23)
└───────── minute (0-59)`}
          </pre>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-sm">Operators</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <code className="font-mono">*</code> any value
            </li>
            <li>
              <code className="font-mono">,</code> list of values, e.g. <code className="font-mono">1,15,30</code>
            </li>
            <li>
              <code className="font-mono">-</code> range, e.g. <code className="font-mono">1-5</code>
            </li>
            <li>
              <code className="font-mono">/</code> step, e.g. <code className="font-mono">*/15</code> every 15
            </li>
            <li>
              Names work too: <code className="font-mono">JAN-DEC</code> and{' '}
              <code className="font-mono">SUN-SAT</code>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
        <h4 className="mb-2 font-semibold text-sm">The one that catches everyone</h4>
        <p className="text-sm text-muted-foreground">
          When <strong>both</strong> the day-of-month and day-of-week fields are set, cron combines
          them with <strong>or</strong>, not <strong>and</strong>.{' '}
          <code className="font-mono">0 9 1 * MON</code> runs on the 1st of the month{' '}
          <em>and</em> on every Monday, not only on Mondays that fall on the 1st. A monthly job
          written that way quietly runs weekly. If only one of the two is set, it behaves as you
          would expect.
        </p>
      </div>

      <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
        <h4 className="mb-2 font-semibold text-sm">Shortcuts</h4>
        <ul className="space-y-1 text-sm text-muted-foreground font-mono">
          <li>
            <strong className="text-foreground">@yearly</strong> / <strong className="text-foreground">@annually</strong>: 0 0 1 1 *
          </li>
          <li>
            <strong className="text-foreground">@monthly</strong>: 0 0 1 * *
          </li>
          <li>
            <strong className="text-foreground">@weekly</strong>: 0 0 * * 0
          </li>
          <li>
            <strong className="text-foreground">@daily</strong> / <strong className="text-foreground">@midnight</strong>: 0 0 * * *
          </li>
          <li>
            <strong className="text-foreground">@hourly</strong>: 0 * * * *
          </li>
        </ul>
      </div>
    </>
  );
}

export function HashGeneratorExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">When you&apos;ll reach for this</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-sm">Verifying a download</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A release page publishes a <code className="font-mono">sha256sum</code> next to the
            binary. Drop the file in, pick SHA-256, and paste their value into the verify box. A
            green match means the bytes you got are the bytes they shipped; a mismatch means
            corruption or tampering, so do not run it.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-sm">Fingerprints and cache keys</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hashes give you a stable fingerprint for a config blob, a build artifact, or a cache
            key. SHA-256 is the modern default; MD5 and SHA-1 still show up on older download pages,
            so they are here for verification only. None of them belong anywhere near password
            storage, where bcrypt or argon2 is the right tool.
          </p>
        </div>
      </div>
    </>
  );
}

export function JwtDecoderExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">Anatomy of a JWT</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        A JWT is three base64url-encoded segments separated by dots. The decoder above splits them
        for you:
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Header</strong>: algorithm (alg), token type (typ),
          and sometimes a key id (kid) to tell the server which key signed this token.
        </li>
        <li>
          <strong className="text-foreground">Payload</strong>: the claims. Standard ones include{' '}
          <code className="font-mono">iss</code> (issuer),{' '}
          <code className="font-mono">sub</code> (subject),{' '}
          <code className="font-mono">aud</code> (audience),{' '}
          <code className="font-mono">exp</code> (expiry, UNIX seconds),{' '}
          <code className="font-mono">iat</code> (issued at),{' '}
          <code className="font-mono">nbf</code> (not before).
        </li>
        <li>
          <strong className="text-foreground">Signature</strong>: used to verify the token was
          issued by the holder of the key. This decoder does not verify signatures, decoding is
          a separate concern from validating.
        </li>
      </ul>

      <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
        <h4 className="mb-2 font-semibold text-sm">Security note</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Decoding a JWT is trivial, the payload is not encrypted. Don&apos;t put secrets in a
          JWT payload. Always verify the signature server-side before trusting any claim.
        </p>
      </div>
    </>
  );
}

export function K8sResourcesExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">How to size Kubernetes Pods</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-sm">Start from real numbers</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Measure actual peak usage from a running Pod with <code className="font-mono">kubectl top pod</code> or Prometheus. Guessing leads to overprovisioning (wastes money) or underprovisioning (evictions and OOMKills).
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-sm">Then add headroom</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Workloads have bursts your metrics didn&apos;t capture. 25-50% headroom is typical. If traffic is unpredictable, lean higher. If cost matters more than reliability, lean lower.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
        <h4 className="mb-2 font-semibold text-sm">Why CPU limits are controversial</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Kubernetes throttles containers that exceed their CPU limit, even when the node has idle CPU. This can cause tail-latency spikes. Many teams set CPU requests (for scheduling fairness) and leave CPU limits unset. Memory limits are different because memory can&apos;t be throttled and has to be bounded somehow.
        </p>
      </div>
    </>
  );
}

export function TimestampConverterExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">When you&apos;ll reach for this</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-sm">Reading logs and database rows</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Logs, JWT <code className="font-mono">exp</code> claims, Kafka offsets, and{' '}
            <code className="font-mono">created_at</code> columns often store raw epoch numbers.
            Paste one in to see the actual date in UTC and your local time, plus whether it was
            recorded in seconds or milliseconds.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-sm">Seconds vs milliseconds</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Unix tools use seconds (<code className="font-mono">date +%s</code>); JavaScript and
            many APIs use milliseconds. Mixing them is a classic off-by-1000 bug. This tool detects
            which one you pasted by its magnitude and shows both, so a cron schedule or a TTL never
            lands a thousand times too early or too late.
          </p>
        </div>
      </div>
    </>
  );
}

export function UuidGeneratorExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">Which format do I pick?</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">UUID v4</strong>: random 128-bit identifier. Great
          for record IDs where order doesn&apos;t matter.
        </li>
        <li>
          <strong className="text-foreground">UUID v7</strong>: timestamp-prefixed, so IDs sort
          chronologically. Better for database primary keys because it avoids the index
          fragmentation that v4 causes.
        </li>
        <li>
          <strong className="text-foreground">Hex 32 / 64</strong>: raw hex tokens. Good for
          opaque API tokens or request IDs. 32 hex chars = 128 bits, 64 hex chars = 256 bits.
        </li>
        <li>
          <strong className="text-foreground">Base64 32</strong>: URL-safe-ish token, 24 random
          bytes → 32 base64 chars. Fits well in cookies and query strings.
        </li>
        <li>
          <strong className="text-foreground">Kube Secret</strong>: base64-encoded 32 random
          bytes, ready to paste into a Secret manifest&apos;s <code className="font-mono">data:</code> field.
        </li>
      </ul>

      <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
        <h4 className="mb-2 font-semibold text-sm">Security note</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All values are generated locally with <code className="font-mono">crypto.getRandomValues</code>. Nothing is sent to a server. If your threat model
          requires hardware-backed randomness (HSM), don&apos;t use a browser tool for that.
        </p>
      </div>
    </>
  );
}

export function YamlJsonFormatterExplainer() {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">When to reach for this</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Debugging Helm values</strong>: paste the rendered template YAML,
          convert to JSON to see the structure clearly.
        </li>
        <li>
          <strong className="text-foreground">Cleaning up an API response</strong>: pretty-print JSON from a
          curl command or paste into YAML for readable diffs.
        </li>
        <li>
          <strong className="text-foreground">Catching syntax errors fast</strong>: the linter surfaces the
          exact position of an unclosed quote or misaligned indent.
        </li>
        <li>
          <strong className="text-foreground">Converting a quick config</strong>: e.g., take a JSON file
          generated by a script and hand it to a YAML-only tool.
        </li>
      </ul>

      <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
        <h4 className="mb-2 font-semibold text-sm">About the round-trip</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          YAML is a superset of JSON in intent but not 1:1. Multi-document YAML streams
          (<code className="font-mono">---</code> separators) can&apos;t be represented as a single JSON value. Anchors
          and merge keys are resolved during parsing; you won&apos;t see them in the JSON output. Comments are not
          preserved in either direction.
        </p>
      </div>
    </>
  );
}
