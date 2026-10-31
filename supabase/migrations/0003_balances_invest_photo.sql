-- 잔액 대조, 투자 현황, 로그인 사진을 위한 변경. 0002_seed_accounts.sql 다음에 한 번 실행.

-- 1. 장부 잔액의 출발점: 이 달 1일 기준 잔액
alter table accounts add column if not exists opening_balance bigint not null default 0;
alter table accounts add column if not exists opening_month date;

-- 엑셀 총자산 현황 9월 말 잔액에서 시작 (1~9월을 옮기면 이 출발점을 앞당긴다)
update accounts set opening_balance = 10016863, opening_month = '2026-10-01'
where name = '카카오뱅크';
update accounts set opening_balance = 33884924, opening_month = '2026-10-01'
where name = '토스뱅크(결혼하자)';

-- 2. 투자 계좌 (엑셀 투자 현황 시트)
do $$
declare
  h uuid := (select id from households order by created_at limit 1);
begin
  update accounts set name = 'ISA (삼성증권)' where household_id = h and name = 'ISA (석민)';
  update accounts set name = 'ISA' where household_id = h and name = 'ISA (현지)';

  insert into accounts (household_id, name, owner_name, kind, sort_order) values
    (h, '퇴직 IRP', '현지', 'investment', 10),
    (h, '종합저축 (국내+해외)', '현지', 'investment', 11),
    (h, '영웅문', '현지', 'investment', 13),
    (h, '퇴직금 (우리증권)', '석민', 'investment', 20),
    (h, 'IRP (우리증권)', '석민', 'investment', 21),
    (h, '종합저축 국내 (영웅문)', '석민', 'investment', 22);
  update accounts set sort_order = 12 where household_id = h and name = 'ISA';
  update accounts set sort_order = 23 where household_id = h and name = 'ISA (삼성증권)';

  -- 9월 기록
  insert into investment_snapshots (household_id, month, account_id, principal, valuation)
  select h, '2026-09-01', a.id, v.principal, v.valuation
  from (values
    ('현지', '퇴직 IRP', 20257481, 36478235),
    ('현지', '종합저축 (국내+해외)', 35310250, 37356855),
    ('현지', 'ISA', null, 32171647),
    ('현지', '영웅문', null, 972500),
    ('석민', '퇴직금 (우리증권)', 65797840, 66190945),
    ('석민', 'IRP (우리증권)', 10350000, 17124598),
    ('석민', '종합저축 국내 (영웅문)', null, 20424000),
    ('석민', 'ISA (삼성증권)', null, 7069777)
  ) as v(owner, name, principal, valuation)
  join accounts a on a.household_id = h and a.name = v.name and a.owner_name = v.owner
  on conflict (household_id, month, account_id) do nothing;
end $$;

-- 3. 로그인 사진: 로그인 화면(로그인 전)에서 보여야 해서 공개 읽기.
--    쓰기는 여전히 두 사람만 가능.
update storage.buckets set public = true where id = 'photos';
