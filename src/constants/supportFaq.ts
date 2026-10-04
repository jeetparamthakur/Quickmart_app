export type SupportFaqItem = {
  id: string;
  questionKey:
    | 'faqOrderTrackQ'
    | 'faqWrongItemsQ'
    | 'faqRefundQ'
    | 'faqPaymentQ'
    | 'faqCouponQ'
    | 'faqAddressQ';
  answerKey:
    | 'faqOrderTrackA'
    | 'faqWrongItemsA'
    | 'faqRefundA'
    | 'faqPaymentA'
    | 'faqCouponA'
    | 'faqAddressA';
};

export const SUPPORT_FAQ_ITEMS: SupportFaqItem[] = [
  { id: 'track', questionKey: 'faqOrderTrackQ', answerKey: 'faqOrderTrackA' },
  { id: 'wrong', questionKey: 'faqWrongItemsQ', answerKey: 'faqWrongItemsA' },
  { id: 'refund', questionKey: 'faqRefundQ', answerKey: 'faqRefundA' },
  { id: 'payment', questionKey: 'faqPaymentQ', answerKey: 'faqPaymentA' },
  { id: 'coupon', questionKey: 'faqCouponQ', answerKey: 'faqCouponA' },
  { id: 'address', questionKey: 'faqAddressQ', answerKey: 'faqAddressA' },
];
