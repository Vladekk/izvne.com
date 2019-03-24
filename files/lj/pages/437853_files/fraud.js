fraudHandler = {
	putMoney : {
		countLV : function () {
			if ($type(Number($('js-fraud_money').value)) == 'number') {
				if (Number($('js-fraud_money').value) > 0) {
					$('js-fraud_money_counted').value = $('js-fraud_money').value*ers[$('js-fraud_currency').value];
					$('js-fraud_money_error').addClass('hidden');
					return true;
				} else {
					$('js-fraud_money_error').removeClass('hidden');
					return false;
				}
				
			} else {
				fraudHandler.putMoney.errorInType();
				return false;
			}
		},
		sendMoney : function () {
			if (fraudHandler.putMoney.countLV()) {
				$('js-LMI_PAYEE_PURSE').value = wps[$('js-fraud_currency').value];
				$('js-LMI_PAYMENT_AMOUNT').value = $('js-fraud_money_counted').value;
				$('js-fraud_money_form').submit();
			}
		},
		errorInType : function () {
			$('js-fraud_money_error').removeClass('hidden');
		}
	}
};