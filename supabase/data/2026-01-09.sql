-- 엑셀 26.01 ~ 26.09 시트를 앱에 옮긴다. 0002, 0003 다음에 실행.
-- 다시 실행하면 1~9월 데이터를 지우고 새로 넣는다. 옮긴 달은 마감 상태로 둔다.
begin;

-- ===== 1월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-01-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-01-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-01-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-01-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-01-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-01-01', 'closed', 600000, 1820000, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-01-01', '현지', 'other', '성과급', 5389510, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-01-01', '현지', 'salary', '월급', 6668981, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-01-01', '현지', 'salary', '월급', 17992910, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-01-01', '석민', 'salary', '월급', 5390000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-01-01', '석민', 'other', '출장비', 656070, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-01-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 777400) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-01-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '창원', 400000),
    ('fixed', '인터넷', 36300),
    ('expense', '옷(무신사)', 129000),
    ('expense', '청모', 114500)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-01-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 1969856) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-01-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '뮤지컬', 340000),
    ('expense', '연회비', 120000),
    ('expense', '창원', 600000),
    ('fixed', '핸드폰비', 56000),
    ('fixed', '유투브 프리미엄', 13900)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-01-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '석민' limit 1), 1485194) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-01-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '출장비', 490000),
    ('expense', '아빠옷', 230000),
    ('expense', '윈도우', 190000),
    ('fixed', '생활비', 212280),
    ('fixed', '정수기', 29900),
    ('fixed', '넷플릭스', 17000),
    ('fixed', '유튜브 프리미엄', 13900),
    ('fixed', '핸드폰비', 79900),
    ('fixed', '도시가스', 19000)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '전세이자', 990000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '교통료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '보험료', 107887, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '교통료', 79120, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '용산팸', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-01-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-01-01', '석민', 'investment', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '석민' and name like 'ISA%' limit 1)),
  ((select id from households order by created_at limit 1), '2026-01-01', '현지', 'investment', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '현지' and name like 'ISA%' limit 1)),
  ((select id from households order by created_at limit 1), '2026-01-01', '석민', 'saving', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-01-01', '현지', 'saving', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));

-- ===== 2월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-02-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-02-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-02-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-02-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-02-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-02-01', 'closed', 850000, 1500000, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-02-01', '석민', 'other', '성과급', 5478679, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-02-01', '현지', 'salary', '월급', 8640000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-02-01', '석민', 'salary', '월급', 8659582, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-02-01', '공통', 'other', '산전검사(여)', 130000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-02-01', '공통', 'other', '산점검사(남)', 44200, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-02-01', '공통', 'dutch', '더치(밥)', 226000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-02-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 502220) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-02-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '이케아', 120000),
    ('expense', '산전검사(여)', 139790)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-02-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 1162452) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-02-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('fixed', '핸드폰비', 59010),
    ('expense', '전기매트', 160550),
    ('fixed', 'gpt', 32000),
    ('fixed', '우주패스', 13900),
    ('expense', '바보섬(석영생일)', 213000)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-02-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '석민' limit 1), 1690968) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-02-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '아부지생신', 339000),
    ('expense', '자동차보험료', 352307),
    ('expense', '기차', 190000),
    ('fixed', '아파트관리비', 203830),
    ('fixed', '정수기', 29900),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '유튜브 프리미엄', 13900),
    ('fixed', '핸드폰비', 108100),
    ('fixed', '도시가스', 29331)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-02-01', 'expense', '자동차수리', 1150000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '전세이자', 845150, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '교통료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '보험료', 107887, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '교통료', 112500, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '용산팸', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-02-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-02-01', '석민', 'saving', 3000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-02-01', '현지', 'saving', 3000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));
-- 2월 투자 2,000만원: 시트에 계좌가 없어 석민 ISA로 넣음 (다르면 알려주세요)
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-02-01', '석민', 'investment', 20000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '석민' and name like 'ISA%' limit 1));

-- ===== 3월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-03-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-03-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-03-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-03-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-03-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-03-01', 'closed', 350000, -100000, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-03-01', '현지', 'salary', '월급', 5697000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-03-01', '석민', 'salary', '월급', 5320000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-03-01', '공통', 'dutch', '더치페이', 66350, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-03-01', '공통', 'other', '보드게임', 107500, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-03-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 293320) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-03-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '보드게임벙', 107500),
    ('fixed', '인터넷', 36300)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-03-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 2455240) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-03-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '홍콩호텔', 518136),
    ('expense', '머리', 67000),
    ('expense', '항공권', 790400),
    ('fixed', '핸드폰', 61950),
    ('fixed', '지피티', 32313),
    ('fixed', '교통비', 70000)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-03-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '석민' limit 1), 1062534) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-03-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('fixed', '아파트관리비', 203830),
    ('fixed', '정수기', 29900),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '유튜브 프리미엄', 13900),
    ('fixed', '핸드폰비', 108100),
    ('fixed', '도시가스', 29331)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-03-01', 'expense', '여행', 865247, '공통', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '전세이자', 800000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '교통료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '보험료', 110000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '교통료', 34650, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '용산팸', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-03-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-03-01', '석민', 'investment', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '석민' and name like 'ISA%' limit 1)),
  ((select id from households order by created_at limit 1), '2026-03-01', '현지', 'investment', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '현지' and name like 'ISA%' limit 1)),
  ((select id from households order by created_at limit 1), '2026-03-01', '석민', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-03-01', '현지', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));

-- ===== 4월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-04-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-04-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-04-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-04-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-04-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-04-01', 'closed', 450000, 0, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-04-01', '현지', 'salary', '월급', 5210833, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-04-01', '석민', 'salary', '월급', 5293620, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-04-01', '공통', 'other', '보드게임', 200000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-04-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 133350);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-04-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 198536);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-04-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지' limit 1), 961369) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-04-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '롯데면세점', 156821),
    ('expense', '루비패스', 123000),
    ('fixed', '차라리', 200000),
    ('fixed', '정수기', 29900),
    ('fixed', '인터넷', 36300),
    ('fixed', '아이클라우드', 14000),
    ('fixed', '관리비', 224610),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '챗지피티', 33943),
    ('fixed', '도시가스', 15960)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-04-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민' limit 1), 2030742) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-04-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '창원', 104200),
    ('expense', '단막(용범)', 164500),
    ('expense', '헬스장', 660000),
    ('expense', '연회비', 120000),
    ('expense', '길정(원이 친구들)', 101000)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '전세이자', 800000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '교통료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '보험료', 110000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '교통료', 34650, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '용산팸', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-04-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-04-01', '석민', 'investment', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '석민' and name like 'ISA%' limit 1)),
  ((select id from households order by created_at limit 1), '2026-04-01', '현지', 'investment', 1500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '현지' and name like 'ISA%' limit 1)),
  ((select id from households order by created_at limit 1), '2026-04-01', '석민', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-04-01', '현지', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));

-- ===== 5월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-05-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-05-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-05-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-05-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-05-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-05-01', 'closed', 300000, 0, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-05-01', '현지', 'salary', '월급', 6100000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-05-01', '석민', 'salary', '월급', 5320000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-05-01', '공통', 'dutch', '더치페이', 100000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-05-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 388850) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-05-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '멸치', 152000),
    ('expense', '주유', 46800)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-05-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 0);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-05-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지' limit 1), 994000) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-05-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '임팀장', 100000),
    ('expense', '교통비', 46000),
    ('expense', '기차', 59800),
    ('fixed', '구독료', 27600),
    ('fixed', '클로드', 33245),
    ('fixed', '정수기', 29900),
    ('fixed', '인터넷', 36300),
    ('fixed', '관리비', 213970),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '경주숙소', 275678)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-05-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민' limit 1), 1850000) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-05-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '브랜든', 278000),
    ('expense', '자동차', 798272),
    ('expense', '핸드폰', 68000),
    ('expense', '의류', 140000)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '전세이자', 800000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '교통료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '보험료', 110000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '교통료', 34650, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '용산팸', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-05-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-05-01', '석민', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-05-01', '현지', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));

-- ===== 6월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-06-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-06-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-06-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-06-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-06-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-06-01', 'closed', 400000, 0, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-06-01', '현지', 'salary', '월급', 6438000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-06-01', '석민', 'salary', '월급', 6488456, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-06-01', '공통', 'other', '칭다오', 686200, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-06-01', '공통', 'other', '홍미네', 205000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-06-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 1427000) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-06-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '비행기', 1023900),
    ('expense', '주유', 131000),
    ('expense', '구공탄', 73000)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-06-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 0);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-06-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지' limit 1), 821000) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-06-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('fixed', '4월교통료', 98600),
    ('fixed', '현지핸드폰', 19700),
    ('expense', '기차', 103400),
    ('fixed', '기차', 119600),
    ('fixed', '클로드 구독', 33520),
    ('fixed', '정수기', 29900),
    ('fixed', '인터넷', 36300),
    ('fixed', '관리비', 220400),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '지피티', 33897)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-06-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민' limit 1), 1221828) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-06-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '위스키장', 119500),
    ('expense', '창원', 116000),
    ('expense', '경주여행', 200000),
    ('expense', '외식', 200000),
    ('expense', '석민핸드폰', 21800)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '전세이자', 830000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '교통료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '보험료', 110000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '교통료', 77300, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-06-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-06-01', '석민', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-06-01', '현지', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));

-- ===== 7월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-07-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-07-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-07-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-07-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-07-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-07-01', 'closed', 100000, 300000, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-07-01', '현지', 'salary', '월급', 8589000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-07-01', '석민', 'salary', '월급', 5500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-07-01', '현지', 'other', '몽미네', 205000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-07-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 126900);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-07-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 0);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-07-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지' limit 1), 756326) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-07-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('fixed', 'lg전자', 6900),
    ('fixed', '현지핸드폰', 19755),
    ('expense', '면세점', 291265),
    ('fixed', '도시가스', 11810),
    ('fixed', '클로드 구독', 34583),
    ('fixed', '정수기', 29900),
    ('fixed', '인터넷', 36300),
    ('fixed', '관리비', 206420),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '지피티', 34797)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-07-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민' limit 1), 1432316) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-07-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '나경이네', 122000),
    ('expense', '파라다이스시티', 413550),
    ('expense', '몽미_티엔미미', 205000),
    ('expense', '구퉁이', 86000),
    ('expense', '석민핸드폰', 21880)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '전세이자', 830000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '용돈', 400000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '보험료', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '교통료', 77300, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'expense', '칭다오여행', 520000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '집 현금'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'expense', '몽미 메론', 17500, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '집 현금'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'expense', '털보떡꼬치', 6000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '집 현금'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-07-01', 'expense', '대출상환', 80000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '집 현금'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-07-01', '현지', 'investment', 8000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and owner_name = '현지' and name like 'ISA%' limit 1)),
  ((select id from households order by created_at limit 1), '2026-07-01', '석민', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-07-01', '현지', 'saving', 5000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));
insert into adjustments (household_id, month, account_id, amount, memo) values
  ((select id from households order by created_at limit 1), '2026-07-01', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), -15000000, '전세대출 상환'),
  ((select id from households order by created_at limit 1), '2026-07-01', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'), -35000000, '전세대출 상환');

-- ===== 8월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-08-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-08-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-08-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-08-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-08-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-08-01', 'closed', 400000, 0, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-08-01', '현지', 'salary', '월급', 6125000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-08-01', '석민', 'salary', '월급', 5500000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-08-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 528160) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-08-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '아빠 청바지', 69300),
    ('expense', '엄마아빠 서울방문 카페', 47000),
    ('expense', '파라다이스호텔', 38700),
    ('expense', '주유비', 93000)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-08-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 0);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-08-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지' limit 1), 551366) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-08-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('fixed', 'lg전자', 6900),
    ('fixed', '현지핸드폰', 19700),
    ('fixed', '도시가스', 11750),
    ('fixed', '정수기', 29900),
    ('fixed', '인터넷', 36300),
    ('fixed', '관리비', 214430),
    ('fixed', '애플', 14000),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '지피티', 32340)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-08-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민' limit 1), 1432316) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-08-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '조개구이', 84000),
    ('expense', '꾸덕집', 76000),
    ('expense', '인스파이어', 31000),
    ('expense', '롯데마트', 107890),
    ('expense', '통신비', 21880),
    ('expense', '구웃배터', 84000),
    ('expense', '티머니충전', 60000),
    ('expense', '엄마아빠철도', 235400)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '전세이자', 620000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '보험료', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '교통료', 77300, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '청약', 50000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-08-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-08-01', '석민', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-08-01', '현지', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));

-- ===== 9월 =====
delete from incomes where household_id = (select id from households order by created_at limit 1) and month = '2026-09-01';
delete from savings where household_id = (select id from households order by created_at limit 1) and month = '2026-09-01';
delete from expense_items where household_id = (select id from households order by created_at limit 1) and month = '2026-09-01';
delete from card_bills where household_id = (select id from households order by created_at limit 1) and month = '2026-09-01';
delete from adjustments where household_id = (select id from households order by created_at limit 1) and month = '2026-09-01';
insert into months (household_id, month, status, gift_cash, new_cash, closed_at) values ((select id from households order by created_at limit 1), '2026-09-01', 'closed', 0, 2000000, now())
  on conflict (household_id, month) do update set status = 'closed', gift_cash = excluded.gift_cash, new_cash = excluded.new_cash, closed_at = now();
insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
  ((select id from households order by created_at limit 1), '2026-09-01', '현지', 'salary', '월급', 6033323, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-09-01', '석민', 'salary', '월급', 5550000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-09-01', '현지', 'dutch', '더치', 47000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-09-01', '석민', 'dutch', '더치', 337400, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-09-01', '석민', 'other', '기후동행', 86000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')),
  ((select id from households order by created_at limit 1), '2026-09-01', '석민', 'dutch', '더치', 116050, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'));
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '하나카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-09-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '하나카드' and owner_name = '현지' limit 1), 624200) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-09-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '호텔 1박', 324298)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지');
insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-09-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '현지' limit 1), 25700);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '롯데카드', '현지', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-09-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '롯데카드' and owner_name = '현지' limit 1), 1378620) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-09-01', v.k, v.t, v.a, '현지', b.id from b, (values
    ('expense', '제주도숙소(2박)', 285000),
    ('expense', '제주도 숙소(1박)', 304377),
    ('expense', '영양제(올리브)', 61100),
    ('expense', '수영준비', 69800),
    ('fixed', 'lg전자', 6900),
    ('fixed', '현지핸드폰', 21950),
    ('fixed', '도시가스', 9720),
    ('fixed', '정수기', 29900),
    ('fixed', '인터넷', 36300),
    ('fixed', '관리비', 248390),
    ('fixed', '애플', 14000),
    ('fixed', '넷플릭스', 15500),
    ('fixed', '지피티', 30749)) as v(k, t, a);
insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  select (select id from households order by created_at limit 1), '현대카드', '석민', (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), 9 where not exists (select 1 from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민');
with b as (insert into card_bills (household_id, month, card_id, total) values ((select id from households order by created_at limit 1), '2026-09-01', (select id from cards where household_id = (select id from households order by created_at limit 1) and name = '현대카드' and owner_name = '석민' limit 1), 1900001) returning id)
insert into expense_items (household_id, month, kind, title, amount, owner_name, card_bill_id)
select (select id from households order by created_at limit 1), '2026-09-01', v.k, v.t, v.a, '석민', b.id from b, (values
    ('expense', '제주도 여행 (식사 등)', 626700),
    ('expense', '동명 닭집', 70000),
    ('expense', '쑥뜸기', 137821),
    ('expense', '제주여행 렌트카', 89000),
    ('expense', '장보기', 65990),
    ('expense', '장모님 드라이기', 87900),
    ('expense', '이너 티셔츠', 69200),
    ('fixed', '핸드폰 요금', 38180),
    ('fixed', '교통비', 60000)) as v(k, t, a);
insert into expense_items (household_id, month, kind, title, amount, owner_name, account_id) values
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '전세이자', 634000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '보험료', 65000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '청약', 100000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '용돈', 300000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '아빠이자', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '보험료', 100000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '교통료', 77300, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'k뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '청약', 50000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '용돈', 300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '우리은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'fixed', '대출이자', 165000, '석민', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '신한은행'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'expense', '온누리', 412500, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'None'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'expense', '명절교통비', 48300, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'None'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'))),
  ((select id from households order by created_at limit 1), '2026-09-01', 'expense', '트레블월렛', 1300000, '현지', coalesce((select id from accounts where household_id = (select id from households order by created_at limit 1) and name = 'None'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크')));
insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
  ((select id from households order by created_at limit 1), '2026-09-01', '석민', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)')),
  ((select id from households order by created_at limit 1), '2026-09-01', '현지', 'saving', 2000000, (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '카카오뱅크'), (select id from accounts where household_id = (select id from households order by created_at limit 1) and name = '토스뱅크(결혼하자)'));

-- 투자 현황 5~7월 기록 (9월은 0003에 있음)
insert into accounts (household_id, name, owner_name, kind, sort_order, active)
  select (select id from households order by created_at limit 1), '종합저축 해외 (영웅문)', '석민', 'investment', 24, false
  where not exists (select 1 from accounts where name = '종합저축 해외 (영웅문)');
insert into investment_snapshots (household_id, month, account_id, principal, valuation)
select a.household_id, v.month::date, a.id, v.principal, v.valuation
from (values
  ('현지', '퇴직 IRP', '2026-05-01', 20257481::bigint, 41224396::bigint),
  ('현지', '종합저축 (국내+해외)', '2026-05-01', 16997752::bigint, 29399318::bigint),
  ('현지', 'ISA', '2026-05-01', 27830084::bigint, 44659279::bigint),
  ('현지', '퇴직 IRP', '2026-06-01', 20257481::bigint, 44534630::bigint),
  ('현지', '종합저축 (국내+해외)', '2026-06-01', 19808834::bigint, 32210400::bigint),
  ('현지', 'ISA', '2026-06-01', 21554490::bigint, 38383685::bigint),
  ('현지', '영웅문', '2026-06-01', 383500::bigint, 1102500::bigint),
  ('현지', '퇴직 IRP', '2026-07-01', 20257481::bigint, 32989541::bigint),
  ('현지', '종합저축 (국내+해외)', '2026-07-01', 27808834::bigint, 33453659::bigint),
  ('현지', 'ISA', '2026-07-01', null::bigint, 36214948::bigint),
  ('현지', '영웅문', '2026-07-01', null::bigint, 870312::bigint),
  ('석민', '퇴직금 (우리증권)', '2026-05-01', 65797840::bigint, 86127608::bigint),
  ('석민', 'IRP (우리증권)', '2026-05-01', 9550000::bigint, 20291318::bigint),
  ('석민', '종합저축 국내 (영웅문)', '2026-05-01', 1114000::bigint, 4700000::bigint),
  ('석민', '종합저축 해외 (영웅문)', '2026-05-01', 19917168::bigint, 21318156::bigint),
  ('석민', 'ISA (삼성증권)', '2026-05-01', 5921047::bigint, 7899862::bigint),
  ('석민', '퇴직금 (우리증권)', '2026-06-01', 65797840::bigint, 87011043::bigint),
  ('석민', 'IRP (우리증권)', '2026-06-01', 9750000::bigint, 22042303::bigint),
  ('석민', '종합저축 국내 (영웅문)', '2026-06-01', null::bigint, 25578556::bigint),
  ('석민', '종합저축 해외 (영웅문)', '2026-06-01', null::bigint, 0::bigint),
  ('석민', 'ISA (삼성증권)', '2026-06-01', 5731899::bigint, 7710714::bigint),
  ('석민', '퇴직금 (우리증권)', '2026-07-01', 65797840::bigint, 67503340::bigint),
  ('석민', 'IRP (우리증권)', '2026-07-01', 9950000::bigint, 16752607::bigint),
  ('석민', '종합저축 국내 (영웅문)', '2026-07-01', null::bigint, 20572432::bigint),
  ('석민', 'ISA (삼성증권)', '2026-07-01', null::bigint, 7199148::bigint)
) as v(owner, name, month, principal, valuation)
join accounts a on a.name = v.name and a.owner_name = v.owner
on conflict (household_id, month, account_id) do update set principal = excluded.principal, valuation = excluded.valuation;

commit;
