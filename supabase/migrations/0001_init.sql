-- 석민과 현지의 살림 기록: 초기 스키마
-- 엑셀 월별 시트(수입 / 지출 / 저축·투자)와 총자산 현황을 그대로 옮긴 구조.
-- 금액은 모두 원 단위 정수(bigint).

create extension if not exists pgcrypto;

-- 우리 집 ---------------------------------------------------------------

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,            -- '석민' | '현지'
  primary key (household_id, user_id)
);

-- RLS 정책에서 쓰는 함수. security definer라서 household_members의 RLS를 다시 타지 않는다.
create or replace function is_member(h uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = h and user_id = auth.uid()
  );
$$;

-- 계좌와 카드 -------------------------------------------------------------

create table accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,                    -- 카카오뱅크, 토스뱅크(결혼하자), 우리은행 ...
  owner_name text,                       -- 석민 | 현지 | null(공동)
  kind text not null check (kind in ('source', 'payment', 'saving', 'investment', 'cash')),
  reconcile boolean not null default false,  -- 월 마감 때 잔액 대조 대상 (카뱅, 결혼하자)
  sort_order int not null default 0,
  active boolean not null default true
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,                    -- 하나카드, 롯데카드, 현대카드
  owner_name text not null,
  payment_account_id uuid references accounts(id),
  sort_order int not null default 0,
  active boolean not null default true
);

-- 월 (엑셀 월별 시트 하나) -----------------------------------------------

create table months (
  household_id uuid not null references households(id) on delete cascade,
  month date not null,                   -- 그 달 1일 (2026-10-01)
  status text not null default 'draft' check (status in ('draft', 'closed')),
  gift_cash bigint not null default 0,   -- 축의금(현금 지출)
  new_cash bigint not null default 0,    -- 집 보관 현금 증감
  note text,
  closed_at timestamptz,
  primary key (household_id, month)
);

create table incomes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  month date not null,
  owner_name text not null,
  kind text not null check (kind in ('salary', 'dutch', 'other')),
  title text not null,                   -- 월급, 더치, 기후동행 ...
  amount bigint not null check (amount >= 0),
  account_id uuid references accounts(id),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (household_id, month) references months(household_id, month) on delete cascade
);

-- 카드별 청구 총액. 생활비 = 총액 - 그 카드의 상세 항목 합
create table card_bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  month date not null,
  card_id uuid not null references cards(id),
  total bigint not null check (total >= 0),
  unique (household_id, month, card_id),
  foreign key (household_id, month) references months(household_id, month) on delete cascade
);

-- 매달 복붙하던 고정지출
create table fixed_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  default_amount bigint not null default 0,
  owner_name text,
  card_id uuid references cards(id),
  account_id uuid references accounts(id),
  sort_order int not null default 0,
  active boolean not null default true,
  check (card_id is not null or account_id is not null)
);

-- 지출 상세 (카드의 큰 항목, 카드 고정지출, 계좌 자동이체)
create table expense_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  month date not null,
  kind text not null check (kind in ('expense', 'fixed')),
  title text not null,
  amount bigint not null check (amount >= 0),
  card_bill_id uuid references card_bills(id) on delete cascade,
  account_id uuid references accounts(id),
  owner_name text,
  template_id uuid references fixed_templates(id),
  confirmed boolean not null default true,  -- 고정지출은 '확정'을 눌러야 true
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  check (card_bill_id is not null or account_id is not null),
  foreign key (household_id, month) references months(household_id, month) on delete cascade
);

create table savings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  month date not null,
  owner_name text not null,
  kind text not null check (kind in ('saving', 'investment')),
  amount bigint not null check (amount >= 0),
  from_account_id uuid not null references accounts(id),  -- 빠진 계좌 (카뱅 / 결혼하자)
  to_account_id uuid not null references accounts(id),    -- 받은 계좌 (결혼하자 / ISA ...)
  foreign key (household_id, month) references months(household_id, month) on delete cascade
);

-- 수식에 직접 넣던 보정 (예: 2026-07 전세대출 상환)
create table adjustments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  month date not null,
  account_id uuid not null references accounts(id),
  amount bigint not null,                -- +/-
  memo text not null,
  foreign key (household_id, month) references months(household_id, month) on delete cascade
);

-- 월 마감 때 입력하는 실제 잔액
create table balance_checks (
  household_id uuid not null,
  month date not null,
  account_id uuid not null references accounts(id),
  actual bigint not null,
  checked_at timestamptz not null default now(),
  primary key (household_id, month, account_id),
  foreign key (household_id, month) references months(household_id, month) on delete cascade
);

-- 투자 현황 (정산 계산과는 별개, 확인용)
create table investment_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  month date not null,
  account_id uuid not null references accounts(id),
  principal bigint,                      -- 원금 (모르면 null)
  valuation bigint not null,             -- 평가금액
  unique (household_id, month, account_id)
);

-- 로그인 화면 사진 등 집 설정
create table household_settings (
  household_id uuid primary key references households(id) on delete cascade,
  login_photo_path text,
  updated_at timestamptz not null default now()
);

-- RLS: 두 사람(household_members)만 읽고 쓴다 ---------------------------

alter table households enable row level security;
alter table household_members enable row level security;
alter table accounts enable row level security;
alter table cards enable row level security;
alter table months enable row level security;
alter table incomes enable row level security;
alter table card_bills enable row level security;
alter table fixed_templates enable row level security;
alter table expense_items enable row level security;
alter table savings enable row level security;
alter table adjustments enable row level security;
alter table balance_checks enable row level security;
alter table investment_snapshots enable row level security;
alter table household_settings enable row level security;

create policy "members read household" on households
  for select using (is_member(id));

create policy "members read members" on household_members
  for select using (is_member(household_id));

do $$
declare t text;
begin
  foreach t in array array[
    'accounts', 'cards', 'months', 'incomes', 'card_bills', 'fixed_templates',
    'expense_items', 'savings', 'adjustments', 'balance_checks',
    'investment_snapshots', 'household_settings'
  ] loop
    execute format(
      'create policy "members only" on %I for all
         using (is_member(household_id)) with check (is_member(household_id))',
      t
    );
  end loop;
end $$;

-- 마감한 달은 잠근다: 마감 후에는 그 달 상세를 고칠 수 없다
create or replace function month_is_open(h uuid, m date) returns boolean
language sql stable as $$
  select coalesce((select status = 'draft' from months where household_id = h and month = m), true);
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'incomes', 'card_bills', 'expense_items', 'savings', 'adjustments'
  ] loop
    execute format(
      'create policy "closed month is read only" on %I as restrictive for insert
         with check (month_is_open(household_id, month))', t);
    execute format(
      'create policy "closed month is read only (update)" on %I as restrictive for update
         using (month_is_open(household_id, month))', t);
    execute format(
      'create policy "closed month is read only (delete)" on %I as restrictive for delete
         using (month_is_open(household_id, month))', t);
  end loop;
end $$;

-- 월 요약 (엑셀 총자산 현황의 수입·지출·고정지출·저축 칸) -------------------

create view month_summary with (security_invoker = true) as
with card_living as (
  -- 카드별 생활비 = 청구 총액 - 그 카드의 상세 합
  select b.household_id, b.month,
         sum(b.total - coalesce(d.detail_sum, 0)) as living
  from card_bills b
  left join (
    select card_bill_id, sum(amount) as detail_sum
    from expense_items where card_bill_id is not null
    group by card_bill_id
  ) d on d.card_bill_id = b.id
  group by b.household_id, b.month
)
select
  m.household_id,
  m.month,
  m.status,
  coalesce((select sum(amount) from incomes i
            where i.household_id = m.household_id and i.month = m.month), 0) as income,
  coalesce(cl.living, 0)
    + coalesce((select sum(amount) from expense_items e
                where e.household_id = m.household_id and e.month = m.month
                  and e.kind = 'expense'), 0) as expense,
  coalesce((select sum(amount) from expense_items e
            where e.household_id = m.household_id and e.month = m.month
              and e.kind = 'fixed'), 0) as fixed,
  m.gift_cash,
  coalesce((select sum(amount) from savings s
            where s.household_id = m.household_id and s.month = m.month
              and s.kind = 'saving'), 0) as saving,
  coalesce((select sum(amount) from savings s
            where s.household_id = m.household_id and s.month = m.month
              and s.kind = 'investment'), 0) as investment,
  m.new_cash
from months m
left join card_living cl on cl.household_id = m.household_id and cl.month = m.month;

-- 로그인 사진 저장소 (비공개) -------------------------------------------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "members manage photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'photos'
         and exists (select 1 from household_members where user_id = auth.uid()))
  with check (bucket_id = 'photos'
              and exists (select 1 from household_members where user_id = auth.uid()));
