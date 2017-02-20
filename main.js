function passToWif(login, pass) {
	if(pass.charAt(0) == '5' && pass.length == 51) {
		return pass;
	} else {
		return steem.auth.toWif(login, pass, 'active');
	}
}

function loadTransaction() {
	if(transaction.from == undefined || transaction.escrow_id == undefined) {
		return false;
	}
	steem.api.getEscrow(
			transaction.from,
			transaction.escrow_id,
			function(err, response) {
				if(!err && !response) {
					$('#errorTransactionNotFound').slideDown();
					$('#escrowData').slideUp();
				} else if (typeof response == 'object') {
					$.each(response, function(index, value) {
						if(transaction[index] == undefined) {
							transaction[index] = value;
						}
					});

					if(transaction.steem_balance == '0.000 ' + LNG.options.steem_simbol[currentLanguage]) {
						transaction.money = transaction.sbd_balance;
					} else {
						transaction.money = transaction.steem_balance;
					}

					var transactionDateExpire = new Date(transaction.escrow_expiration);

					if(!transaction.agent_approved || !transaction.to_approved) {
						transaction.status = 'waitingForApproval';
					} else if (transaction.disputed) {
						transaction.status = 'disputeInitiated';
					} else if (transactionDateExpire < currentDate) {
						transaction.status = 'escrowExpired';
					} else {
						transaction.status = 'approvalRecieved';
					}

					$('div.' + transaction.status).show();
					if(!transaction.to_approved) {
						$('div.waitingForApprovalTo').show();
					}
					if(!transaction.agent_approved) {
						$('div.waitingForApprovalAgent').show();
					}
					//console.log(transaction);
					$('span.transactionId').html('<a href="?id=' + transaction.id + '">' + transaction.id + '</a>');
					$('span.transactionFrom').html('<a target="_blank" href="https://' + LNG.options.url[currentLanguage] + '/@' + transaction.from + '">@' + transaction.from + '</a>');
					$('span.transactionTo').html('<a target="_blank" href="https://' + LNG.options.url[currentLanguage] + '/@' + transaction.to + '">@' + transaction.to + '</a>');
					$('span.transactionAgent').html('<a target="_blank" href="https://' + LNG.options.url[currentLanguage] + '/@' + transaction.agent + '">@' + transaction.agent + '</a>');
					$('span.transactionMoney').html(transaction.money);
					$('span.transactionFee').html(transaction.pending_fee);
					$('span.transactionDate').html(transaction.escrow_expiration);
					$('span.transactionDeadline').html(transaction.ratification_deadline);

					var meta = '';
					steem.api.getAccountHistory(
							transaction.from,
							-1,
							100,
							function(err, response) {
								if(!err && response.length) {
									$.each(response, function(index, val) {
										if(val[1]['op'][0] == 'escrow_transfer') {
											if(parseInt(val[1]['op'][1]['escrow_id']) == parseInt(transaction.escrow_id)) {
												meta = $.parseJSON(val[1]['op'][1]['json_meta']);
											}
										}
									});
									$('span.transactionMeta').html(meta.meta !== undefined ? meta.meta : JSON.stringify(meta));
								}
							}
					);

				}

			}
	);

	transaction.submitApprove = function(login, pass, approve, callback) {
		steem.broadcast.escrowApprove(
				passToWif(login, pass),
				transaction.from,
				transaction.to,
				transaction.agent,
				login,
				transaction.escrow_id,
				approve,
				function(err, response) {
					callback();
				}
		);
	}

	transaction.submitRelease = function(login, pass, callback) {
		steem.broadcast.escrowRelease(
				passToWif(login, pass),
				transaction.from,
				transaction.to,
				transaction.agent,
				login,
				login == transaction.from ? transaction.to : transaction.from,
				transaction.escrow_id,
				transaction.sbd_balance,
				transaction.steem_balance,
				function(err, response) {
					callback();
				}
		);
	}

	transaction.submitExpired = function(login, pass, callback) {
		steem.broadcast.escrowRelease(
				passToWif(login, pass),
				transaction.from,
				transaction.to,
				transaction.agent,
				login,
				login == transaction.from ? transaction.from : transaction.to,
				transaction.escrow_id,
				transaction.sbd_balance,
				transaction.steem_balance,
				function(err, response) {
					callback();
				}
		);
	}

	transaction.submitDispute = function(login, pass, callback) {
		steem.broadcast.escrowDispute(
				passToWif(login, pass),
				transaction.from,
				transaction.to,
				transaction.agent,
				login,
				transaction.escrow_id,
				function(err, response) {
					callback();
				}
		);
	}

	transaction.submitEscrow = function(login, pass, reciever, callback) {
		steem.broadcast.escrowRelease(
				passToWif(login, pass),
				transaction.from,
				transaction.to,
				transaction.agent,
				login,
				transaction[reciever],
				transaction.escrow_id,
				transaction.sbd_balance,
				transaction.steem_balance,
				function(err, response) {
					callback();
				}
		);
	}

}

$(function() {
	// Set language
	$.each(LNG.byElement, function(index, value) {
		$(index).html(value[currentLanguage]);
	});
	$.each(LNG.byId, function(index, value) {
		var elById = $('#' + index);
		if (typeof elById.attr('placeholder') !== typeof undefined && elById.attr('placeholder') !== false) {
			elById.attr('placeholder', value[currentLanguage]);
		} else {
			elById.html(value[currentLanguage]);
		}
	});
	$.each(LNG.byClass, function(index, value) {
		$('.' + index).html(value[currentLanguage]);
	});


	$('a.inputToggle').click(function() {
		if($(this).text() == LNG.options.steem_simbol[currentLanguage]) {
			$('.inputToggle').text(LNG.options.sbd_simbol[currentLanguage]);
		} else {
			$('.inputToggle').text(LNG.options.steem_simbol[currentLanguage]);
		}
		return false;
	});

	$('a#tabCP').click(function() {
		if(!transaction.id) {
			transaction.id = prompt(LNG.words.enterId[currentLanguage]);
			if(!transaction.id) {
				return false;
			}
			window.location.href = '?id=' + transaction.id;
		}
		$(this).parent().addClass('active').siblings().removeClass('active');
		$('#step1, #step2-' + currentLanguage).hide();
		$('#controlPanel').show();
		return false;
	});

	$('a#tabSend').click(function() {
		$(this).parent().addClass('active').siblings().removeClass('active');
		$('#step1').show();				
		$('#controlPanel').hide();
		return false;
	});


	$('#buttonSendSubmit').click(function() {
		var btn = $(this),
		from = $('#inputSendLogin').val(),
		to = $('#inputSendReceiver').val(),
		wif = passToWif(from, $('#inputSendPassword').val()),
		agent = $('#sendAgent').val(),
		escrow_id = parseInt(Math.random() * (99999999 - 10000000) + 10000000),
		fee = parseFloat($('#sendAgent option:selected').data('fee')).toFixed(3) + ' ' + $('#aSendAmountUnit').text(),
		sbd_amount = '0.000 ' + LNG.options.sbd_simbol[currentLanguage],
		steem_amount = '0.000 ' + LNG.options.steem_simbol[currentLanguage],
		meta = {
			meta: $('#inputSendMeta').val()
		};

		if(!from || !to || !agent || !fee) {
			return false;
		}
		
		btn.prop('disabled', true);
		
		if($('#aSendAmountUnit').text() == LNG.options.steem_simbol[currentLanguage]) {
			steem_amount = parseFloat($('#inputSendAmount').val().replace(',','.')).toFixed(3) + ' ' + LNG.options.steem_simbol[currentLanguage];
		} else if ($('#aSendAmountUnit').text() == LNG.options.sbd_simbol[currentLanguage]) {
			sbd_amount = parseFloat($('#inputSendAmount').val().replace(',','.')).toFixed(3) + ' ' + LNG.options.sbd_simbol[currentLanguage];
		}

		steem.api.getDynamicGlobalProperties(function(err, response) {
			// Added 'Z' to get correct UTC time in all browsers
			var ratification_deadline = new Date(response.time+'Z');
			ratification_deadline.setMinutes(ratification_deadline.getMinutes() + parseInt($('#sendDeadline').val()) * 60 - 1);

			var escrow_expiration = new Date(response.time+'Z');
			escrow_expiration.setHours(escrow_expiration.getHours() + parseInt($('#sendEscrowExpiration').val()));


			//return false;
			steem.broadcast.escrowTransfer(
				wif, // active key
				from,
				to, // to
				agent, // escrow nick
				escrow_id,
				sbd_amount, // amount gbg/sbd
				steem_amount, // amount golos/steem
				fee, // fee
				ratification_deadline,
				escrow_expiration,
				JSON.stringify(meta),
				function(err, response) {
					if(!err && response.ref_block_num) {
						if(from) {
							localStorage.setItem('escrow_login', from);
						}
						$('#sendError').slideUp();
						$('#step1').slideUp();
						$('#step2-' + currentLanguage).slideDown();
						$('.sentLink').html('<a href="?id=' + from + '-' + escrow_id + '-' + LNG.options.network[currentLanguage] + '">https://golosim.ru/escrow/?id=' + from + '-' + escrow_id + '-' + LNG.options.network[currentLanguage] + '</a>');
						$('.sentId').html(from + '-' + escrow_id);
					} else {
						$('#sendError').html('<br><b>Возникла ошибка:</b><br><br>');
						if(err.payload !== undefined) {
							$('#sendError').append(err.payload.error.message.replace(/([^>])\n/g, '$1<br><br>'));
						} else {
							$('#sendError').append(err);
						}
						btn.prop('disabled', false);
					}
				}
			);
		});
	});
	$('#escrowData').on('click', 'button', function() {
		$('#transactionType').val($(this).data('form'));
		$('form').hide();
		$('#' + $(this).data('form')).show();
		$('#sendTransaction').hide();
		$('#sendTransaction').slideDown();
		$('input[type=submit]').prop('disabled', false); // fix firefox page refresh
		$('#inputActionLogin').val(transaction[$(this).data('nick')]);
		$('#inputActionPassword').val('').focus();
		if($(this).data('answer') == '1') {
			$('#approveYes').prop('checked', true);
		} else if($(this).data('answer') == '0') {
			$('#approveNo').prop('checked', true);
		}
		if($(this).data('answer') == 'escrowFrom') {
			$('#escrowFrom').prop('checked', true);
		} else if($(this).data('answer') == 'escrowTo') {
			$('#escrowTo').prop('checked', true);
		}
	});
	
	$('#approveForm').submit(function(e) {
		$(this).find('input[type=submit]').prop('disabled', true);
		transaction.submitApprove(
			$('#inputActionLogin').val(),
			$('#inputActionPassword').val(),
			$('#approveYes').is(':checked') ? 'true' : 'false',
			function(err, response) {
				location.reload();
			}
		);
		return false;
	});

	$('#releaseForm, #cancelForm').submit(function(e) {
		$(this).find('input[type=submit]').prop('disabled', true);
		e.preventDefault();
		transaction.submitRelease(
			$('#inputActionLogin').val(),
			$('#inputActionPassword').val(),
			function(err, response) {
				location.reload();
			}
		);
		return false;
	});

	$('#expiredForm').submit(function(e) {
		$(this).find('input[type=submit]').prop('disabled', true);
		e.preventDefault();
		transaction.submitExpired(
			$('#inputActionLogin').val(),
			$('#inputActionPassword').val(),
			function(err, response) {
				location.reload();
			}
		);
		return false;
	});

	$('#startDisputForm').submit(function(e) {
		$(this).find('input[type=submit]').prop('disabled', true);
		e.preventDefault();
		transaction.submitDispute(
			$('#inputActionLogin').val(),
			$('#inputActionPassword').val(),
			function(err, response) {
				location.reload();
			}
		);
		return false;
	});

	$('#escrowForm').submit(function() {	
		$(this).find('input[type=submit]').prop('disabled', true);
		transaction.submitEscrow(
			$('#inputActionLogin').val(),
			$('#inputActionPassword').val(),
			($('#escrowFrom').is(':checked') ? 'from' : 'to'),
			function(err, response) {
				location.reload();
			}
		);
		return false;
	});
				
	if(localStorage.getItem('escrow_login') !== undefined && localStorage.getItem('escrow_login')) {
		$('#inputSendLogin').val(localStorage.getItem('escrow_login'));
	}
		
	var blockchainDatetime;

	$('#sendAgent').change(function() {
		var agent = $('#sendAgent').val();
		if(agent) {
			$('#agentFeeWrap').slideDown();
		} else {
			$('#agentFeeWrap').slideUp();
		}
		$('#labelSendFeeAmout').html(LNG.byId.labelSendFeeAmout[currentLanguage] + ' <a href="https://' + LNG.options.url[currentLanguage] + '/@' + agent + '" target="_blank">@' + agent + '</a>');
		$('#sendFeeAmout').val($('#sendAgent option:selected').data('fee'));
	});

	// добавляем гарантов из блокчейна, сортируем по репутации
	steem.api.getContentReplies(LNG.options.agents_list_post_author[currentLanguage], LNG.options.agents_list_post_permlink[currentLanguage], function(err, result) {
		if(!err) {
			result.sort(function(a, b) {
				if (parseInt(a.author_reputation) < parseInt(b.author_reputation))
					return 1;
				if (parseInt(a.author_reputation) > parseInt(b.author_reputation))
					return -1;
				return 0;
			});
			$.each(result, function(index, val) {
				if(val.body !== undefined) {
					var matches = val.body.match(/^([0-9.]+) (.*)/);
					if(matches) {
						matches[1] = 0.001;
						if (matches && matches.length == 3) {
							$('#sendAgent').append('<option value="' + val.author + '" data-fee="' + parseFloat(matches[1]).toFixed(3) + '">' + val.author + ', ' + LNG.words.reputation[currentLanguage] + ' ' + (Math.max(Math.log10(Math.abs(parseInt(val.author_reputation))) - 9, 0) * (parseInt(val.author_reputation) > 0 ? 1 : -1) * 9 + 25).toFixed(1) + ', ' + LNG.words.fee[currentLanguage] + ' ' + parseFloat(matches[1]).toFixed(3) + ', ' + matches[2] + '</option>');
						}
					}
				}
			});
			//$('#sendAgent').prop('disabled', false).change();
		}
	});



	if(transaction.id) {
		$('#tabCP').click();
		steem.api.getDynamicGlobalProperties(function(err, response) {
			blockchainDatetime = new Date(response.time + 'Z');
			$('span.transactionDateCurrent').html(response.time);
			loadTransaction();
		});


	} else {
		
		$('#tabSend').click();

		if($('#inputSendLogin').val()) {
			$('#inputSendPassword').focus();
		} else {
			$('#inputSendLogin').focus();
		}
	}
	
});
