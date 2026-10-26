import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, CircleCheck, Clock, Gauge, Info, ListFilter, Sparkles, ThumbsUp } from 'lucide-react';
import { useRequests } from '@/store/RequestsProvider';
import { DEPARTMENTS, departmentName } from '@/data/departments';
import {
  DAILY_VOLUME_14D,
  DEPARTMENT_BASELINES,
  FEEDBACK_TREND,
  SERVICE_INSIGHTS,
  SERVICE_TARGETS,
} from '@/data/history';
import { OPERATIONAL_DEPARTMENTS } from '@/services/routing';
import { isTerminal } from '@/services/requestEngine';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Panel, SectionHeading, StatTile } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Feedback';
import { cx, inr, minutesSince } from '@/utils/format';
import type { DepartmentId, ServiceRequest } from '@/types';

const PALETTE = {
  gold: '#c2a266',
  sage: '#6b8b73',
  clay: '#a8674a',
  brass: '#c08a3e',
  ink: '#0b1622',
  warm: '#8a8177',
  sand: '#d9cdb8',
  forest: '#39553f',
};

const STATUS_SERIES: Array<{ status: ServiceRequest['status']; label: string; color: string }> = [
  { status: 'submitted', label: 'Submitted', color: PALETTE.brass },
  { status: 'accepted', label: 'Accepted', color: PALETTE.ink },
  { status: 'in_progress', label: 'In progress', color: PALETTE.gold },
  { status: 'completed', label: 'Completed', color: PALETTE.sage },
  { status: 'rejected', label: 'Rejected', color: PALETTE.clay },
  { status: 'cancelled', label: 'Cancelled', color: PALETTE.warm },
];

/** Minutes between submission and the first acceptance event, averaged. */
function averageFirstResponse(requests: ServiceRequest[]): number {
  const samples = requests
    .map((request) => {
      const submitted = request.history.find((event) => event.status === 'submitted');
      const accepted = request.history.find((event) => event.status === 'accepted');
      return submitted && accepted ? (accepted.at - submitted.at) / 60000 : null;
    })
    .filter((value): value is number => value !== null && value >= 0);

  if (!samples.length) return 0;
  return Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length);
}

/**
 * Management dashboard: live KPIs and charts computed from the prototype's own
 * request state, alongside clearly-labelled sample history for context.
 */
export function AdminDashboard() {
  const { requests, tick } = useRequests();

  const live = useMemo(() => {
    void tick;
    const open = requests.filter((request) => !isTerminal(request.status));
    const completed = requests.filter((request) => request.status === 'completed');
    const declined = requests.filter(
      (request) => request.status === 'rejected' || request.status === 'cancelled',
    );
    const value = open.reduce((sum, request) => sum + (request.value ?? 0), 0);
    const oldest = open.reduce((max, request) => Math.max(max, minutesSince(request.submittedAt)), 0);

    return {
      total: requests.length,
      open: open.length,
      completed: completed.length,
      declined: declined.length,
      response: averageFirstResponse(requests),
      completionRate: requests.length ? Math.round((completed.length / requests.length) * 100) : 0,
      openValue: value,
      oldest,
    };
  }, [requests, tick]);

  const byDepartment = useMemo(
    () =>
      OPERATIONAL_DEPARTMENTS.map((department) => {
        const items = requests.filter((request) => request.department === department);
        return {
          department: departmentName(department as DepartmentId),
          short: departmentName(department as DepartmentId).split(' ')[0],
          open: items.filter((request) => !isTerminal(request.status)).length,
          completed: items.filter((request) => request.status === 'completed').length,
          total: items.length,
          response: averageFirstResponse(items),
        };
      }),
    [requests],
  );

  const statusMix = useMemo(
    () =>
      STATUS_SERIES.map((entry) => ({
        ...entry,
        value: requests.filter((request) => request.status === entry.status).length,
      })).filter((entry) => entry.value > 0),
    [requests],
  );

  const baselineData = DEPARTMENT_BASELINES.map((entry) => ({
    department: entry.department.split(' ')[0],
    actual: entry.avgMinutes,
    target: entry.targetMinutes,
  }));

  const feedbackData = FEEDBACK_TREND.map((entry) => ({
    label: entry.label,
    rating: entry.rating,
    responses: entry.responses,
  }));

  return (
    <div className="pb-14">
      {/* Hero ---------------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden border-b border-warm-200">
        <ImageWithFallback
          src="/images/admin-hall.jpg"
          alt=""
          className="absolute inset-0 h-full w-full"
          imgClassName="object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ink-950/78" />

        <div className="relative mx-auto max-w-[1560px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className="eyebrow text-gold-400">Property-wide · live prototype state</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(1.9rem,4vw,2.9rem)] text-ivory-50">
            Service operations, at a glance
          </h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-cream-200/85">
            Every figure below is computed from the requests moving through this demonstration —
            accept something in a department dashboard and the tiles and charts here change with it.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              dark
              label="Requests in session"
              value={live.total}
              hint={`${live.open} still open across all teams`}
            />
            <StatTile
              dark
              tone={live.response <= SERVICE_TARGETS.responseTargetMinutes ? 'sage' : 'gold'}
              label="Avg first response"
              value={`${live.response} min`}
              hint={`Sample target ${SERVICE_TARGETS.responseTargetMinutes} min`}
            />
            <StatTile
              dark
              tone={live.completionRate >= 60 ? 'sage' : 'gold'}
              label="Completion rate"
              value={`${live.completionRate}%`}
              hint={`${live.completed} completed · ${live.declined} declined`}
            />
            <StatTile
              dark
              tone={live.oldest > 30 ? 'clay' : 'sage'}
              label="Oldest open request"
              value={`${live.oldest}m`}
              hint={`${inr(live.openValue)} indicative value open`}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1560px] px-4 pt-8 sm:px-6 lg:px-8">
        {/* Volume + mix ---------------------------------------------------- */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <Panel>
            <SectionHeading
              eyebrow="Sample history"
              title="Service volume · last 14 days"
              description="Illustrative series giving the prototype realistic context. Independent of anything created during the demonstration."
              action={<Badge tone="neutral">Sample history</Badge>}
            />
            <div className="mt-5 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_VOLUME_14D} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PALETTE.gold} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="done" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PALETTE.sage} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={PALETTE.sage} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e7ded0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={{ stroke: '#e7ded0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0b1622',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 4,
                      color: '#f1ebe1',
                      fontSize: 12.5,
                    }}
                    labelStyle={{ color: '#c2a266', fontSize: 11, letterSpacing: '0.12em' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    name="Requests"
                    stroke={PALETTE.gold}
                    strokeWidth={2}
                    fill="url(#volume)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke={PALETTE.sage}
                    strokeWidth={2}
                    fill="url(#done)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <SectionHeading
              eyebrow="Live"
              title="Status mix"
              description="Every request currently held in prototype state."
              action={<Badge tone="gold">Live</Badge>}
            />
            <div className="mt-4 h-[280px] w-full">
              {statusMix.length === 0 ? (
                <p className="grid h-full place-items-center text-[13.5px] text-warm-500">
                  No requests in state.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusMix}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {statusMix.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0b1622',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 4,
                        color: '#f1ebe1',
                        fontSize: 12.5,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={34}
                      formatter={(value) => (
                        <span style={{ color: '#6e675e', fontSize: 12 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </div>

        {/* Department charts ------------------------------------------------ */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Panel>
            <SectionHeading
              eyebrow="Live"
              title="Requests by department"
              description="Open versus completed work, computed from the shared queue."
              action={<Badge tone="gold">Live</Badge>}
            />
            <div className="mt-5 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDepartment} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e7ded0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="short"
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={{ stroke: '#e7ded0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(11,22,34,0.04)' }}
                    contentStyle={{
                      background: '#0b1622',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 4,
                      color: '#f1ebe1',
                      fontSize: 12.5,
                    }}
                    labelStyle={{ color: '#c2a266', fontSize: 11, letterSpacing: '0.12em' }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: '#6e675e', fontSize: 12 }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="open" name="Open" fill={PALETTE.gold} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill={PALETTE.sage} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <SectionHeading
              eyebrow="Sample history"
              title="Response time vs target"
              description="Static department baselines used for comparison only."
              action={<Badge tone="neutral">Sample</Badge>}
            />
            <div className="mt-5 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={baselineData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#e7ded0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="department"
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={{ stroke: '#e7ded0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(11,22,34,0.04)' }}
                    contentStyle={{
                      background: '#0b1622',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 4,
                      color: '#f1ebe1',
                      fontSize: 12.5,
                    }}
                    labelStyle={{ color: '#c2a266', fontSize: 11, letterSpacing: '0.12em' }}
                  />
                  <Legend formatter={(value) => <span style={{ color: '#6e675e', fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="actual" name="Avg minutes" fill={PALETTE.brass} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="target" name="Target minutes" fill={PALETTE.sand} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Feedback trend + insights --------------------------------------- */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Panel>
            <SectionHeading
              eyebrow="Sample history"
              title="Guest rating trend"
              description="Eight-week illustrative CSAT series — not measured from this prototype."
              action={<Badge tone="neutral">Sample</Badge>}
            />
            <div className="mt-5 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={feedbackData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#e7ded0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={{ stroke: '#e7ded0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[3.5, 5]}
                    tick={{ fill: '#6e675e', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0b1622',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 4,
                      color: '#f1ebe1',
                      fontSize: 12.5,
                    }}
                    labelStyle={{ color: '#c2a266', fontSize: 11, letterSpacing: '0.12em' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    name="Rating"
                    stroke={PALETTE.gold}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: PALETTE.gold, strokeWidth: 0 }}
                  />
                  <Bar dataKey="responses" name="Responses" fill={PALETTE.sage} opacity={0.35} radius={[3, 3, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[12.5px] text-warm-500">
              <ThumbsUp className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
              Sample CSAT target {SERVICE_TARGETS.csatTarget} · sample acceptance target{' '}
              {Math.round(SERVICE_TARGETS.acceptanceRateTarget * 100)}%
            </p>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Analyst notes" title="Insights" description="Narrative observations paired with the charts." />
            <ul className="mt-5 space-y-3.5">
              {SERVICE_INSIGHTS.map((insight) => (
                <li
                  key={insight.id}
                  className={cx(
                    'rounded-[3px] border px-4 py-3',
                    insight.tone === 'positive'
                      ? 'border-sage-500/40 bg-sage-500/10'
                      : insight.tone === 'attention'
                        ? 'border-clay-500/40 bg-clay-500/10'
                        : 'border-cream-300 bg-ivory-100',
                  )}
                >
                  <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-900">
                    {insight.tone === 'positive' ? (
                      <CircleCheck className="h-4 w-4 text-sage-600" strokeWidth={1.8} />
                    ) : insight.tone === 'attention' ? (
                      <Gauge className="h-4 w-4 text-clay-600" strokeWidth={1.8} />
                    ) : (
                      <Sparkles className="h-4 w-4 text-gold-600" strokeWidth={1.8} />
                    )}
                    {insight.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-warm-600">{insight.detail}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Department table -------------------------------------------------- */}
        <Panel className="mt-5" padded={false}>
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-cream-300 px-5 py-4 sm:px-6">
            <div>
              <p className="eyebrow-sm text-warm-500">Live</p>
              <h3 className="display mt-2 text-[1.35rem] text-ink-900">Department scoreboard</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-warm-500">
              <ListFilter className="h-3.5 w-3.5" strokeWidth={1.7} />
              Computed from prototype state
            </span>
          </header>

          <div className="overflow-x-auto scroll-slim">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-cream-300 bg-ivory-100/70">
                  {['Department', 'Open', 'In progress', 'Completed', 'Total', 'Avg first response'].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="eyebrow-sm px-5 py-3 font-semibold text-warm-600 first:pl-6 last:pr-6"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300">
                {byDepartment.map((row) => {
                  const meta = DEPARTMENTS.find((entry) => entry.name === row.department);
                  const inProgress = requests.filter(
                    (request) => request.department === meta?.id && request.status === 'in_progress',
                  ).length;
                  return (
                    <tr key={row.department} className="transition-colors hover:bg-warm-50">
                      <td className="px-5 py-3.5 first:pl-6">
                        <p className="text-[14px] font-medium text-ink-900">{row.department}</p>
                        <p className="text-[12.5px] text-warm-500">{meta?.subtitle}</p>
                      </td>
                      <td className="tnum px-5 py-3.5 text-[14px] text-ink-800">{row.open}</td>
                      <td className="tnum px-5 py-3.5 text-[14px] text-ink-800">{inProgress}</td>
                      <td className="tnum px-5 py-3.5 text-[14px] text-ink-800">{row.completed}</td>
                      <td className="tnum px-5 py-3.5 text-[14px] text-ink-800">{row.total}</td>
                      <td className="px-5 py-3.5 last:pr-6">
                        <span
                          className={cx(
                            'tnum text-[14px]',
                            row.response > SERVICE_TARGETS.responseTargetMinutes
                              ? 'text-clay-600'
                              : 'text-forest-700',
                          )}
                        >
                          {row.response || '—'} min
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Notice tone="gold" title="What is live">
            <p>
              KPI tiles, the status mix, the department bar chart and the scoreboard are computed
              from requests in this browser session — they move as the demonstration runs.
            </p>
          </Notice>
          <Notice tone="neutral" title="What is sample history">
            <p>
              The 14-day volume, response baselines and rating trend are static illustrative series
              (clearly badged “sample”) so the dashboard reads like a real management view.
            </p>
          </Notice>
          <Notice tone="clay" title="What is out of scope">
            <p>
              No property management system, payment gateway, staffing roster, forecasting service or
              external analytics is connected. Everything runs locally on mock data.
            </p>
          </Notice>
        </div>

        <p className="mt-6 flex items-center gap-2 text-[12.5px] text-warm-500">
          <Info className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
          Management figures refresh automatically every 30 seconds with the shared state pulse.
          <Clock className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
          <ArrowUpRight className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.7} />
        </p>
      </div>
    </div>
  );
}
