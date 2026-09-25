# 电力配网抢修工单系统

面向供电所值班室的配网故障**报修登记 → 技能派工 → 抢修流转 → 复电确认**全链路平台：
登记故障必须关联台账资产，派工按故障类型匹配待命班组技能，已有未结工单的班组不能接单；
派工时故障单、工单、班组占用同一事务更新；复电确认释放班组并把资产健康恢复为正常；
不满足条件时逐班组给出阻断原因，页面可直接看到"哪里不满足"和当前占用。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

- 前端（值班室页面）：<http://localhost:20104>
- 后端健康检查：<http://localhost:21104/health>

> 后端存储层为可替换设计（`backend/src/repositories/store.ts` 进程内事务表 +
> `database/init.sql` 的 MySQL 表结构/规则表/占用视图），本地无需数据库即可演示完整链路。

## 业务链路（规则、存储、页面分开承担）

```text
登记故障(故障报修页)
  ├─ 必须选择在册资产 GridAsset（游离资产 404）
  ├─ 按严重等级联动资产健康：低→关注 WATCH，中→降级 DEGRADED，高/紧急→危急 DANGEROUS
  └─ 自动生成 WAIT_DISPATCH 工单（故障单+工单+资产健康同一事务）

派工分析(抢修工单页)
  ├─ 规则 rules/skillMatrix：故障类型 → 必备技能
  │     OUTAGE→停电抢修  VOLTAGE_LOW/TRIP→线路检修
  │     EQUIPMENT_DAMAGE→设备检修  SAFETY_RISK→带电作业
  ├─ 规则 rules/dispatchRules 逐班组判定（纯函数）：
  │     ① 技能标签覆盖必备技能  ② duty_status=ON_DUTY 待命  ③ current_ticket_id 为空（无未结工单）
  └─ GET /api/repair-ticket/:id/dispatch-plan 返回每个班组 eligible + reasons[]

确认派工 POST /api/repair-ticket/:id/dispatch
  ├─ 服务端按规则二次复核，任一不满足返回 409 + 明确错误码：
  │     SKILL_NOT_MATCHED 技能不符 / CREW_OFF_DUTY 非待命 / CREW_BUSY 有未结工单
  │     TICKET_ALREADY_DISPATCHED 工单已派 / NO_AVAILABLE_CREW 无合格班组
  └─ 同一事务同时更新：工单 ASSIGNED+assigned_at、故障单 ASSIGNED、班组 current_ticket_id

到场 → 抢修中 POST /api/repair-ticket/:id/advance（班组保持占用）

复电确认 POST /api/repair-ticket/:id/restore（仅 REPAIRING 可执行）
  └─ 同一事务同时更新：工单 RESTORED+restored_at、故障单 RESTORED、
      班组 current_ticket_id=NULL（释放）、资产 health_status=NORMAL（恢复正常）
```

分层职责：

| 层 | 位置 | 承担 |
|---|---|---|
| 规则 | `backend/src/rules/`、`fault_skill_rule` 表、`v_crew_dispatch_eligibility` 视图 | 技能矩阵、严重度→健康、派工资格判定、阻断码 |
| 存储 | `backend/src/repositories/store.ts`（事务表）、`database/init.sql`、各 Repository | 原子提交，三处状态同时更新或同时不动 |
| 服务 | `backend/src/services/*Service.ts` | 登记/派工/流转/复电编排、规则复核、异常包装 |
| 页面 | `frontend/src/pages/*`、`components/common/DispatchPanel.vue`、`CrewCard.vue` | 登记资产选择、阻断原因展示、班组占用一览、复电操作 |

页面可见的信息：

- **抢修态势 `/dashboard`**：待派工/在途/未结故障数、占用与待命班组数、异常资产、平均复电时长、班组实时占用。
- **故障报修 `/faults`**：左侧资产树选资产登记，可按线路筛选；登记成功的单子高亮，展示关联工单与状态。
- **抢修工单 `/tickets`**：待派工工单展开即显示逐班组"可派 / ⛔阻断原因（技能不符 / 非待命 / 占用中#工单号）"；
  在途工单可"确认到场 / 开始抢修 / 复电确认"；右侧常驻**班组当前占用**面板。
- **配网资产 `/assets`**：按线路分组的资产树、健康状态展示，点击资产查看历史故障。

## 本地开发方式

- 后端：`cd backend && npm install && npm run dev`（监听 3000，接口前缀 `/api`）
- 前端：`cd frontend && npm install && npm run dev`（监听 20104，`/api` 代理到 `http://localhost:3000`）

接口速查：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/dashboard` | 抢修态势聚合统计 |
| GET | `/api/grid-asset?feeder_line=` | 资产台账 / 线路筛选 |
| GET/POST | `/api/fault-report` | 故障列表 / 登记（关联资产、联动健康、生成待派工单） |
| GET | `/api/crew`、`/api/crew/occupancy` | 班组列表 / 当前占用一览 |
| GET | `/api/repair-ticket` | 工单列表（含故障类型、资产、班组名聚合） |
| GET | `/api/repair-ticket/:id/dispatch-plan` | 派工候选 + 每班组阻断原因 |
| POST | `/api/repair-ticket/:id/dispatch` | 确认派工（body: `{team_id}`） |
| POST | `/api/repair-ticket/:id/advance` | 到场 / 抢修中 |
| POST | `/api/repair-ticket/:id/restore` | 复电确认（释放班组、恢复资产） |

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia（自定义轻量组件，无第三方 UI 运行时依赖） |
| 后端 | Node.js + Express + TypeScript（routes / controllers / services / repositories / rules 分层） |
| 数据库 | MySQL 8.0（规则表 + 占用/资格视图；当前进程内存储为可替换实现） |
| 部署 | Docker Compose（frontend / backend / db 三服务） |

## 项目目录结构

```text
frontend/src/
├── api/                  # 统一请求封装 client.ts + 按实体一个文件
├── stores/               # Pinia：派工/复电后整链刷新 fault/ticket/crew/asset
├── types/                # FaultReport / RepairTicket / Crew / GridAsset / Dispatch
├── constants/            # 枚举、错误码、错误消息、日志模板、严重度/待命状态
├── constructors/         # 默认表单/响应构造器，页面不散写结构
├── components/common/    # StatusBadge PriorityTag CrewCard DispatchPanel
│                         # TimelineList AssetTree StatCard EmptyState
├── hooks/                # useTicketFlow(状态机) useCrewAvailability(阻断文案) usePagination
├── pages/                # Dashboard Faults Tickets Assets Parts
├── router/ utils/ mocks/ # 路由、中文格式化、离线兜底种子
backend/src/
├── routes/ controllers/ services/   # 接口、参数解析、业务编排与异常包装
├── rules/                 # skillMatrix(技能矩阵) dispatchRules(资格判定纯函数)
├── repositories/          # store.ts 事务内存表 + 按实体 re-export
├── models/ constructors/  # 实体模型与响应 DTO 工厂
├── constants/             # 枚举/错误码/错误消息/日志模板/待命状态
├── middlewares/ utils/ types/ config/
database/init.sql          # MySQL 表、fault_skill_rule 规则表、占用与派工资格视图
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`（容器内 3000）
- `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`: MySQL 端口与凭据

## Docker 部署说明

- 根 Compose 不写 `version`，顶层 `name: grid-repair`，容器名均带 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷 `db_data`，不绑定挂载，避免中文路径问题；带 healthcheck，后端 `depends_on: condition: service_healthy`。
- Nginx 把 `/api/` 反代到 `http://backend:3000/`，其余路径 `try_files ... /index.html`。
- 端口冲突改 `.env`；重置数据执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- **FaultType（OUTAGE/VOLTAGE_LOW/TRIP/EQUIPMENT_DAMAGE/SAFETY_RISK）**
  - 后端：`constants/FaultType.ts`、`rules/skillMatrix.ts`（技能矩阵）、
    `models/FaultReport.ts`、`constructors/FaultReportDtoFactory.ts`、
    `services/FaultReportService.ts`（校验）、`services/RepairTicketService.ts`（派工分析）、
    `constants/errorCodes.ts` / `errorMessages.ts`（SKILL_NOT_MATCHED）、
    `constants/logTemplates.ts`、`database/init.sql`（fault_type 枚举、fault_skill_rule）。
  - 前端：`constants/FaultType.ts`（枚举+中文+技能文案）、`types/FaultType.ts`、
    `utils/formatters.ts`、`mocks/seedData.ts`、`constructors/FaultReportConstructor.ts`、
    `pages/FaultsPage.vue`（登记下拉）、`components/common/DispatchPanel.vue`、
    `constants/statusText.ts`、`stores/FaultReportStore.ts`（日志模板）。
- **TicketStatus（WAIT_DISPATCH/ASSIGNED/ARRIVED/REPAIRING/RESTORED/CLOSED）**
  - 后端：`constants/TicketStatus.ts`、`rules/skillMatrix.ts`（未结集合）、
    `services/RepairTicketService.ts`（派工/流转/复电校验）、`models/RepairTicket.ts`、
    `repositories/store.ts`（未结工单查询）、`constants/errorCodes.ts`（状态冲突/重复派工）、
    `constants/logTemplates.ts`、`database/init.sql`（status 枚举、占用视图）。
  - 前端：`constants/TicketStatus.ts`（中文）、`types/TicketStatus.ts`、
    `hooks/useTicketFlow.ts`（状态机/按钮可用性）、`utils/formatters.ts`、
    `components/common/StatusBadge.vue`、`TimelineList.vue`、`pages/TicketsPage.vue`、
    `mocks/seedData.ts`、`constants/statusText.ts`。
- **AssetHealthStatus（NORMAL/WATCH/DEGRADED/DANGEROUS）**
  - 后端：`constants/AssetHealthStatus.ts`、`rules/skillMatrix.ts`（严重度→健康）、
    `services/FaultReportService.ts`（登记劣化）、`services/RepairTicketService.ts`（复电恢复 NORMAL）、
    `models/GridAsset.ts`、`constants/logTemplates.ts`、`database/init.sql`（health_status 枚举）。
  - 前端：`constants/AssetHealthStatus.ts`（中文）、`types/AssetHealthStatus.ts`、
    `utils/formatters.ts`、`components/common/StatusBadge.vue`、`components/common/AssetTree.vue`、
    `pages/AssetsPage.vue`、`mocks/seedData.ts`、`constants/statusText.ts`。
- **DutyStatus（ON_DUTY/OFF_DUTY/RESTING）/ Severity（LOW/MEDIUM/HIGH/CRITICAL）**
  - 后端 `constants/DutyStatus.ts`、`rules/dispatchRules.ts`（仅 ON_DUTY 可接单）；
    前端 `constants/DutyStatus.ts`、`constants/Severity.ts`、`CrewCard.vue`、`PriorityTag.vue`。

## 为什么会牵一发动全身

派工规则被刻意拆成三层：判定在 `rules/`（纯函数 + MySQL 规则表/视图）、状态提交在
`repositories/store.ts` 的事务里（故障单/工单/班组占用/资产健康必须同时生效）、
阻断呈现分散在错误码、错误消息、日志模板、DTO、前端 hook、CrewCard/DispatchPanel 组件。
新增一个故障类型或放宽一条接单条件，至少要同步：技能矩阵（后）、规则表/视图（库）、
错误文案（双端）、日志模板、前端枚举与格式化、派工面板与种子数据、README 清单。

## License

MIT
