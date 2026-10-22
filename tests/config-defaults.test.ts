/**
 * Secure defaults for NEW configurations.
 *
 * A configuration that sets nothing must not poll a POS, trust the private
 * LAN, or whitelist vendor/dev origins. Existing explicit values stay as set.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ConfigManager } from '../src/utils/config';
import { OriginPolicy } from '../src/api/origin-policy';

let dir: string;
let configPath: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xp-defaults-'));
  configPath = path.join(dir, 'config.json');
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('secure defaults for a new config', () => {
  it('disables the POS backup poller and private-network trust', () => {
    const cfg = new ConfigManager(configPath).getConfig();
    expect(cfg.backup?.enabled).toBe(false);
    expect(cfg.security.allowPrivateNetwork).toBe(false);
  });

  it('ships loopback-only allowed origins, no vendor host and no dev ports', () => {
    const origins = new ConfigManager(configPath).getConfig().security.allowedOrigins;
    expect(origins.length).toBeGreaterThan(0);
    for (const o of origins) {
      expect(new URL(o).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
      expect(o).not.toMatch(/xenithpulse/);
      expect(o).not.toMatch(/:(3000|3001|8080|8090)$/);
    }
  });

  it('still allows the dashboard served from loopback on the service port', () => {
    const cfg = new ConfigManager(configPath).getConfig();
    const policy = new OriginPolicy({
      allowedOrigins: cfg.security.allowedOrigins,
      allowPrivateNetwork: cfg.security.allowPrivateNetwork
    });
    expect(policy.check(`http://127.0.0.1:${cfg.server.port}`).allowed).toBe(true);
    expect(policy.check('http://pos.xenithpulse.local:8090').allowed).toBe(false);
  });

  it('does not inject vendor origins into an existing explicit config', () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ security: { allowedOrigins: ['https://app.example.com'] } })
    );
    const origins = new ConfigManager(configPath).getConfig().security.allowedOrigins;
    expect(origins).toEqual(['https://app.example.com']);
  });

  it('keeps explicit backup and private-network values of an existing config', () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ backup: { enabled: true }, security: { allowPrivateNetwork: true } })
    );
    const cfg = new ConfigManager(configPath).getConfig();
    expect(cfg.backup?.enabled).toBe(true);
    expect(cfg.security.allowPrivateNetwork).toBe(true);
  });
});
