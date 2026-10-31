-- 엑셀 26.10 시트 기준 계좌, 카드, 고정지출 목록.
-- 0001_init.sql과 "우리 집에 두 사람 연결" SQL을 실행한 뒤 한 번만 실행한다.

do $$
declare
  h uuid := (select id from households order by created_at limit 1);
  kakao uuid; toss uuid; woori uuid; shinhan uuid; kbank uuid;
  hana uuid; lotte uuid; hyundai uuid;
begin
  if h is null then
    raise exception '먼저 households / household_members를 만들어 주세요';
  end if;

  insert into accounts (household_id, name, owner_name, kind, reconcile, sort_order)
  values (h, '카카오뱅크', null, 'source', true, 1) returning id into kakao;
  insert into accounts (household_id, name, owner_name, kind, reconcile, sort_order)
  values (h, '토스뱅크(결혼하자)', null, 'saving', true, 2) returning id into toss;
  insert into accounts (household_id, name, owner_name, kind, sort_order)
  values (h, '우리은행', '현지', 'payment', 3) returning id into woori;
  insert into accounts (household_id, name, owner_name, kind, sort_order)
  values (h, '신한은행', '석민', 'payment', 4) returning id into shinhan;
  insert into accounts (household_id, name, owner_name, kind, sort_order)
  values (h, 'k뱅크', '현지', 'payment', 5) returning id into kbank;
  insert into accounts (household_id, name, owner_name, kind, sort_order) values
    (h, 'ISA (석민)', '석민', 'investment', 6),
    (h, 'ISA (현지)', '현지', 'investment', 7),
    (h, '집 현금', null, 'cash', 8);

  insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  values (h, '하나카드', '현지', woori, 1) returning id into hana;
  insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  values (h, '롯데카드', '현지', woori, 2) returning id into lotte;
  insert into cards (household_id, name, owner_name, payment_account_id, sort_order)
  values (h, '현대카드', '석민', shinhan, 3) returning id into hyundai;

  insert into fixed_templates (household_id, title, default_amount, owner_name, card_id, account_id, sort_order) values
    (h, 'lg전자', 6900, '현지', lotte, null, 1),
    (h, '현지핸드폰', 21950, '현지', lotte, null, 2),
    (h, '도시가스', 9800, '현지', lotte, null, 3),
    (h, '정수기', 29900, '현지', lotte, null, 4),
    (h, '인터넷', 36300, '현지', lotte, null, 5),
    (h, '관리비', 252880, '현지', lotte, null, 6),
    (h, '애플', 14000, '현지', lotte, null, 7),
    (h, '네이버(넷플릭스)', 10000, '현지', lotte, null, 8),
    (h, '지피티', 30749, '현지', lotte, null, 9),
    (h, '핸드폰 요금', 58000, '석민', hyundai, null, 10),
    (h, '교통비', 30000, '석민', hyundai, null, 11),
    (h, '전세이자', 634000, '석민', null, shinhan, 12),
    (h, '보험료', 65000, '석민', null, shinhan, 13),
    (h, '청약', 100000, '석민', null, shinhan, 14),
    (h, '용돈', 300000, '석민', null, shinhan, 15),
    (h, '대출이자', 165000, '석민', null, shinhan, 16),
    (h, '아빠이자', 300000, '현지', null, woori, 17),
    (h, '보험료', 100000, '현지', null, woori, 18),
    (h, '교통료', 77300, '현지', null, kbank, 19),
    (h, '청약', 50000, '현지', null, woori, 20),
    (h, '용돈', 300000, '현지', null, woori, 21),
    (h, '용산팸', 0, '현지', null, kakao, 22);
end $$;
