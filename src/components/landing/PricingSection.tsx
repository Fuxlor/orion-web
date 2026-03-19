'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '@/lib/api';
import { fetchPlans, PlansConfig, PlanDisplay } from '@/lib/plans';

export function PricingSection() {
  const [plans, setPlans] = useState<PlansConfig | null>(null);

  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => { });
  }, []);

  async function handleGetPro() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      window.location.href = '/register';
      return;
    }
    const res = await apiFetch('/api/billing/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.ok && data.url) window.location.href = data.url;
  }

  function handleStartFree() {
    window.location.href = '/register';
  }

  function getFeatures(d: PlanDisplay): string[] {
    const features: string[] = [
      `${d.logs} logs/month`,
      `${d.retention} retention`,
      `${d.storage} storage`,
      `${d.sources} max sources`,
    ];
    if (d.alerts !== false) features.push(`Alerts: ${d.alerts}`);
    features.push(d.support);
    return features;
  }

  const PLAN_META: Record<string, { highlighted: boolean; cta: string; onCta: () => void }> = {
    free: { highlighted: false, cta: 'Get started', onCta: handleStartFree },
    pro: { highlighted: true, cta: 'Start free trial', onCta: handleGetPro },
    enterprise: { highlighted: false, cta: 'Contact Us', onCta: () => { window.location.href = 'mailto:contact@orion.dev'; } },
  };

  const planOrder = ['free', 'pro', 'enterprise'];

  return (
    <section
      id="pricing"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.01)',
      }}
      className="py-24"
    >
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 46px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              marginBottom: 12,
              color: 'white',
            }}
          >
            Simple, transparent pricing
          </h2>
          <p style={{ color: '#9ba3af', fontSize: 16 }}>No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {!plans
            ? planOrder.map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#13161f',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16,
                  padding: 28,
                  height: 340,
                  animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                }}
              />
            ))
            : planOrder.map((key, i) => {
              const d = plans.display[key];
              if (!d) return null;
              const meta = PLAN_META[key] ?? PLAN_META.free;
              const features = getFeatures(d);
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  style={{
                    backgroundColor: meta.highlighted ? 'rgba(2,241,148,0.05)' : '#13161f',
                    border: `1px solid ${meta.highlighted ? 'rgba(2,241,148,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 16,
                    padding: 28,
                    position: 'relative',
                  }}
                >
                  {meta.highlighted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#02f194',
                        color: '#0d0f16',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 12px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: '#9ba3af', marginBottom: 6, textTransform: 'capitalize' }}>{key}</div>
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontSize: 38, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>
                        {d.price.split('/')[0].trim()}
                      </span>
                      {d.price.includes('/') && (
                        <span style={{ color: '#9ba3af', fontSize: 14 }}>/{d.price.split('/')[1].trim()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 mb-7">
                    {features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <Check
                          size={14}
                          style={{ color: meta.highlighted ? '#02f194' : '#4b5563', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 13, color: '#d1d5db' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: meta.highlighted ? '0 0 20px rgba(2,241,148,0.25)' : 'none' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={meta.onCta}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      backgroundColor: meta.highlighted ? '#02f194' : 'rgba(255,255,255,0.07)',
                      color: meta.highlighted ? '#0d0f16' : 'white',
                      fontFamily: 'inherit',
                    }}
                  >
                    {meta.cta}
                  </motion.button>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
