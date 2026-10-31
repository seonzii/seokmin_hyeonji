-- 엑셀 26.10 시트를 앱에 옮긴다. 0002_seed_accounts.sql 다음에 실행.
-- 여러 번 실행해도 10월 데이터를 지우고 다시 넣는다.

do $$
declare
  h uuid := (select id from households order by created_at limit 1);
  m date := '2026-10-01';
  kakao uuid := (select id from accounts where household_id = h and name = '카카오뱅크');
  toss uuid := (select id from accounts where household_id = h and name = '토스뱅크(결혼하자)');
  isa_s uuid := (select id from accounts where household_id = h and name = 'ISA (석민)');
  hana uuid; lotte uuid; hyundai uuid;
begin
  if kakao is null then
    raise exception '먼저 0002_seed_accounts.sql을 실행해 주세요';
  end if;

  -- 다시 실행할 때를 위해 10월 데이터 비우기
  delete from incomes where household_id = h and month = m;
  delete from savings where household_id = h and month = m;
  delete from expense_items where household_id = h and month = m;
  delete from card_bills where household_id = h and month = m;

  insert into months (household_id, month, gift_cash, new_cash)
  values (h, m, 50000, 2000000)
  on conflict (household_id, month)
  do update set gift_cash = excluded.gift_cash, new_cash = excluded.new_cash;

  -- 수입
  insert into incomes (household_id, month, owner_name, kind, title, amount, account_id) values
    (h, m, '현지', 'salary', '월급', 6027200, kakao),
    (h, m, '석민', 'salary', '월급', 5750000, kakao);

  -- 카드 청구 총액
  insert into card_bills (household_id, month, card_id, total)
  select h, m, id, case name when '하나카드' then 1602896 when '롯데카드' then 751918 else 1937644 end
  from cards where household_id = h and name in ('하나카드', '롯데카드', '현대카드');

  select b.id into hana from card_bills b join cards c on c.id = b.card_id where b.household_id = h and b.month = m and c.name = '하나카드';
  select b.id into lotte from card_bills b join cards c on c.id = b.card_id where b.household_id = h and b.month = m and c.name = '롯데카드';
  select b.id into hyundai from card_bills b join cards c on c.id = b.card_id where b.household_id = h and b.month = m and c.name = '현대카드';

  -- 카드 큰 항목
  insert into expense_items (household_id, month, kind, title, amount, card_bill_id) values
    (h, m, 'expense', '나경 잠수함', 123000, hana),
    (h, m, 'expense', '석민동호회', 428500, hana),
    (h, m, 'expense', '민병철유폰', 367506, hana),
    (h, m, 'expense', '캠핑', 120000, hana),
    (h, m, 'expense', '기차비', 319000, hana),
    (h, m, 'expense', '치과', 297200, lotte),
    (h, m, 'expense', '쿠팡(약/브라운)', 516980, hyundai),
    (h, m, 'expense', '제주도 여행', 322900, hyundai),
    (h, m, 'expense', '오빠바지', 103200, hyundai),
    (h, m, 'expense', '오빠가방', 104490, hyundai),
    (h, m, 'expense', '현지가죽자켓', 119000, hyundai),
    (h, m, 'expense', '산부인과', 50400, hyundai),
    (h, m, 'expense', '창원 점심', 100500, hyundai);

  -- 고정지출 확정 (10월 금액 = 템플릿 기본값, 용산팸은 금액 없음)
  insert into expense_items (household_id, month, kind, title, amount, owner_name, template_id, card_bill_id, account_id)
  select h, m, 'fixed', t.title, t.default_amount, t.owner_name, t.id,
         case c.name when '롯데카드' then lotte when '현대카드' then hyundai end,
         case when t.card_id is null then t.account_id end
  from fixed_templates t left join cards c on c.id = t.card_id
  where t.household_id = h and t.active and t.default_amount > 0;

  -- 저축 · 투자 (ISA 500만원은 결혼하자에서 빠짐)
  insert into savings (household_id, month, owner_name, kind, amount, from_account_id, to_account_id) values
    (h, m, '석민', 'investment', 5000000, toss, isa_s),
    (h, m, '석민', 'saving', 2000000, kakao, toss),
    (h, m, '현지', 'saving', 2000000, kakao, toss);
end $$;
