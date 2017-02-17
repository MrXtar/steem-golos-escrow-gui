function passToWif(login, pass) {
	if(pass.charAt(0) == '5' && pass.length == 51) {
		return pass;
	} else {
		return steem.auth.toWif(login, pass, 'active');
	}
}

function gup( name ) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
	return "";
  else
	return results[1];
}		

function Transaction(id, onLoadCallback) {
	if(!id.match( /^[a-z0-9\.\-]+-[\d]+$/ )) {
		alert('Не верный ID ' + id);
		return false;
	}
	
	var parts = id.split('-'),
		obj = this;
	obj.from = parts[0];
	obj.escrow_id = parts[1];	
	
	steem.api.getEscrow(
		obj.from,
		obj.escrow_id,
		function(err, response) {
			if(!err && !response) {
				$('#result div.alert-danger').slideDown();
			} else if (typeof response == 'object') {
				//console.log(response);
				$.each(response, function(index, value) {
					obj[index] = value;
				}); 
				if(obj.steem_balance == '0.000 GOLOS') {
					obj.money = obj.sbd_balance;
				} else {
					obj.money = obj.steem_balance;
				}
				
				
				if(!obj.agent_approved || !obj.to_approved) {
					obj.status = 'waitingForApproval';
				} else if (obj.disputed) {
					obj.status = 'disputeInitiated';
				} else {
					obj.status = 'approvalRecieved';
				}
				
				onLoadCallback(obj);
			}
			//console.log(err, obj);
		}
	);

	obj.submitApprove = function(login, pass, approve, callback) {		
		steem.broadcast.escrowApprove(
			passToWif(login, pass),
			obj.from,
			obj.to,
			obj.agent,
			login,
			obj.escrow_id,
			approve,
			function(err, response) {
				//console.log(err, response);
				callback();
			}
		);
	}
	
	obj.submitRelease = function(login, pass, callback) {
			steem.broadcast.escrowRelease(
				passToWif(login, pass),
				obj.from,
				obj.to,
				obj.agent,
				login,			
				login == obj.from ? obj.to : obj.from,
				obj.escrow_id,
				obj.sbd_balance,
				obj.steem_balance,
				function(err, response) {
					//console.log(err, response);
					callback();
				}
			);
	}
	
	obj.submitDispute = function(login, pass, callback) {
		steem.broadcast.escrowDispute(
			passToWif(login, pass),
			obj.from,
			obj.to,
			obj.agent,
			login,			
			obj.escrow_id,
			function(err, response) {
				//console.log(err, response);
				callback();
			}
		);
	}
	
	obj.submitEscrow = function(login, pass, reciever, callback) {
		steem.broadcast.escrowRelease(
			passToWif(login, pass),
			obj.from,
			obj.to,
			obj.agent,
			login,			
			obj[reciever],
			obj.escrow_id,
			obj.sbd_balance,
			obj.steem_balance,
			function(err, response) {
				//console.log(err, response);
				callback();
			}
		);
	}	
	
}
	
$(function() {
	$('a.inputToggle').click(function() {
		var toggles = $(this).data('toggles').split('-');
		if($(this).text() == toggles[0]) {
			$('.inputToggle').text(toggles[1]);
		} else {
			$('.inputToggle').text(toggles[0]);
		}
		return false;
	});

	$('a#tabCP').click(function() {
		if(!id) {
			id = prompt('Введите ID транзакции. Например xtar-8724723:');									
			if(!id) {
				return false;
			}
			window.location.replace("?id=" + id);
		}
		$(this).parent().addClass('active').siblings().removeClass('active');
		$('#step1, #step2').hide();				
		$('#controlPanel').show();
		return false;
	});

	$('a#tabSend').click(function() {
		$(this).parent().addClass('active').siblings().removeClass('active');
		$('#step1').show();				
		$('#controlPanel').hide();
		return false;
	});


	$('#sendSubmit').click(function() {
		var btn = $(this),
		from = $('#sendLogin').val(),
		to = $('#sendReceiver').val(),
		wif = passToWif(from, $('#sendPassword').val()),
		agent = $('#sendAgent').val(),
		escrow_id = parseInt(Math.random() * (99999999 - 10000000) + 10000000),
		fee = parseFloat($('#sendAgent option:selected').data('fee')).toFixed(3) + ' ' + $('#sendAmountUnit').text(),
		sbd_amount = '0.000 GBG',
		steem_amount = '0.000 GOLOS',
		meta = {
			meta: $('#sendMeta').val()
		};
		
		btn.prop('disabled', true);
		
		if($('#sendAmountUnit').text() == 'GOLOS') {
			steem_amount = parseFloat($('#sendAmount').val().replace(',','.')).toFixed(3) + ' GOLOS';
		} else if ($('#sendAmountUnit').text() == 'GBG') {
			sbd_amount = parseFloat($('#sendAmount').val().replace(',','.')).toFixed(3) + ' GBG';
		}

		steem.api.getDynamicGlobalProperties(function(err, response) {
			// Added 'Z' to get correct UTC time in all browsers
			var ratification_deadline = new Date(response.time+'Z');
			ratification_deadline.setMinutes(ratification_deadline.getMinutes() + 24 * 60 - 1);
						
			var escrow_expiration = new Date(response.time+'Z');
			escrow_expiration.setHours(escrow_expiration.getHours() + parseInt($('#sendEscrowExpiration').val()));			


			//return false;
			steem.broadcast.escrowTransfer(
				wif, // active key
				from,
				to, // to
				agent, // escrow nick
				escrow_id,
				sbd_amount, // amount gbg
				steem_amount, // amount golos
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
						$('#step2').slideDown();
						$('.sentLink').html('<a href="?id=' + from + '-' + escrow_id + '">https://golosim.ru/escrow/?id=' + from + '-' + escrow_id + '</a>');
						$('.sentId').html(from + '-' + escrow_id);
					} else {
						$('#sendError').html(
							'<br><b>Возникла ошибка:</b><br><br>' +
							err.payload.error.message.replace(/([^>])\n/g, '$1<br><br>')
						);
						btn.prop('disabled', false);
					}
					//console.log(err, response);
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
		$('#login').val(transaction[$(this).data('nick')]);
		$('#password').val('').focus();
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
			$('#login').val(),
			$('#password').val(),
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
			$('#login').val(),
			$('#password').val(),
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
			$('#login').val(),
			$('#password').val(),
			function(err, response) {
				location.reload();
			}
		);
		return false;
	});

	$('#escrowForm').submit(function() {	
		$(this).find('input[type=submit]').prop('disabled', true);
		transaction.submitEscrow(
			$('#login').val(),
			$('#password').val(),
			($('#escrowFrom').is(':checked') ? 'from' : 'to'),
			function(err, response) {
				location.reload();
			}
		);
		return false;
	});
				
	if(localStorage.getItem('escrow_login') !== undefined && localStorage.getItem('escrow_login')) {
		$('#sendLogin').val(localStorage.getItem('escrow_login'));
	}
		
	var transaction,
	id = gup('id');

	$('#sendAgent').change(function() {
		var agent = $('#sendAgent').val();
		$('#sendFeeAmoutLabel').html('Комиссия от <a href="https://golos.io/@' + agent + '" target="_blank">@' + agent + '</a>');
		$('#sendFeeAmout').val($('#sendAgent option:selected').data('fee'));
	});

	// добавляем гарантов из блокчейна, сортируем по репутации
	steem.api.getContentReplies('xtar', 'khochesh-stat-garantom-bud-im', function(err, result) {
		if(!err) {
			if(result.length) {
				$('#sendAgent').html('');
			}
			result.sort(function(a, b) {
				return a.author_reputation < b.author_reputation;
			});
			//console.log(result);
			$.each(result, function(index, val) {
				if(val.body !== undefined) {
					var matches = val.body.match(/^([0-9.]+) (.*)/);
					if(matches && matches.length == 3) {
						$('#sendAgent').append('<option value="' + val.author + '" data-fee="' + parseFloat(matches[1]).toFixed(3) + '">' + val.author + ', репутация ' + (Math.max( Math.log10(Math.abs(parseInt(val.author_reputation))) - 9, 0) * (parseInt(val.author_reputation) > 0 ? 1 : -1) * 9 + 25).toFixed(1) + ', комиссия ' + parseFloat(matches[1]).toFixed(3) + ', ' + matches[2] + '</option>');
					}
				}
			});
			$('#sendAgent').prop('disabled', false).change();
		}
	});



	if(id) {
		transaction = new Transaction(gup('id'), function(transaction) {
			$('div.' + transaction.status).show();
			if(!transaction.to_approved) {
				$('div.waitingForApprovalTo').show();
			}
			if(!transaction.agent_approved) {
				$('div.waitingForApprovalAgent').show();
			}
			//console.log(transaction);
			$('span.transactionId').html('<a href="?id=' + transaction.from + '-' + transaction.escrow_id + '">' + transaction.from + '-' + transaction.escrow_id + '</a>');
			$('span.transactionFrom').html('<a target="_blank" href="https://golos.io/@' + transaction.from + '">@' + transaction.from + '</a>');
			$('span.transactionTo').html('<a target="_blank" href="https://golos.io/@' + transaction.to + '">@' + transaction.to + '</a>');
			$('span.transactionAgent').html('<a target="_blank" href="https://golos.io/@' + transaction.agent + '">@' + transaction.agent + '</a>');
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
						$('span.transactionMeta').html(JSON.stringify(meta));
					}
				}
			);

			steem.api.getDynamicGlobalProperties(function(err, response) {
				$('span.transactionDateCurrent').html(response.time);
			});
		});
		if(transaction.from === undefined) {
			id = null;
			$('#tabSend').click();
		} else {
			$('#tabCP').click();
		}
	} else {
		
		$('#tabSend').click();

		if($('#sendLogin').val()) {
			$('#sendPassword').focus();
		} else {
			$('#sendLogin').focus();
		}
	}
	
});
