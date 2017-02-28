// get params from url
function gup( name ) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null) {
		results = localStorage.getItem(name);
		if(results) {
			return results;
		} else {
			return '';
		}
	} else {
		if(name == 'l' || name == 'blockchain') {
			localStorage.setItem(name, results[1]);
		}
		return results[1];
	}
}

function calcRep(rep) {
	return (Math.max(Math.log10(Math.abs(parseInt(rep))) - 9, 0) * (parseInt(rep) > 0 ? 1 : -1) * 9 + 25).toFixed(1);
}

// Loading blockchain
var BLOCKCHAINS = {
	steem: {
		network: 'steem',
		websocket: 'wss://steemd.steemit.com',
		address_prefix: 'STM',
		chain_id: '0000000000000000000000000000000000000000000000000000000000000000',
		steem_ticker: 'STEEM',
		sbd_ticker: 'SBD',
		url: 'steemit.com',
		agents_list_post_author: 'xtar',
		agents_list_post_permlink: 'escrow-agents-homepage',
		board_post_author: 'xtar',
		board_post_permlink: 'board'
	},
	golos: {
		network: 'golos',
		websocket: 'wss://ws.golos.io',
		address_prefix: 'GLS',
		chain_id: "782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12",
		steem_ticker: 'GOLOS',
		sbd_ticker: 'GBG',
		url: 'golos.io',
		agents_list_post_author: 'xtar',
		agents_list_post_permlink: 'khochesh-stat-garantom-bud-im',
		board_post_author: 'xtar',
		board_post_permlink: 'board'
	}},
	BLOCKCHAIN,
	transaction = {
		id: gup('id')
	},
	matches = transaction.id.match(/^([a-z0-9\.\-]+)-([\d]+)-([steem|golos]+)$/),
	currentBlockchain = gup('blockchain'),
	currentTab = gup('tab');

if (matches && matches.length) {
	transaction.from = matches[1];
	transaction.escrow_id = parseInt(matches[2]);
	if (matches[3] !== undefined) {
		if(BLOCKCHAINS[matches[3]] != undefined) {
			currentBlockchain = matches[3];
		}
	}
} else {
	transaction.id = null;
}
if(!currentBlockchain) {
	currentBlockchain = 'steem';
}
BLOCKCHAIN = BLOCKCHAINS[currentBlockchain];

// need for replace {string} in localization
String.prototype.replaceArray = function(find, replace) {
	var replaceString = this,
		find = [
			'{steem_ticker}',
			'{sbd_ticker}'
		], replace = [
			BLOCKCHAIN.steem_ticker,
			BLOCKCHAIN.sbd_ticker
		];
	for (var i = 0; i < find.length; i++) {
		replaceString = replaceString.replace(find[i], replace[i]);
	}
	return replaceString;
};

Date.hoursBetween = function( date1, date2 ) {
	//Get 1 day in milliseconds
	var one_hour=1000*60*60;

	// Convert both dates to milliseconds
	var date1_ms = date1.getTime();
	var date2_ms = date2.getTime();

	// Calculate the difference in milliseconds
	var difference_ms = date2_ms - date1_ms;

	// Convert back to days and return
	return Math.round(difference_ms/one_hour);
};

function showTab() {
	$('#header ul li').show();
	$('#currentBlockchain').text(BLOCKCHAIN.steem_ticker);
	if(transaction.id) {
		$('#tabCP').click();
		$('span.transactionDateCurrent').html(BLOCKCHAIN.timeString);
		loadTransaction();
	} else if (currentTab == 'board') {
		$('#tabBoard').click();
	} else {
		$('#tabSend').click();
		if($('#inputSendLogin').val()) {
			$('#inputSendPassword').focus();
		} else {
			$('#inputSendLogin').focus();
		}
	}
}

// load lng
function changeLanguage() {
	$.each(LNG.byElement, function(index, value) {
		$(index).html(value.replaceArray());
	});
	console.log(LNG.byId);
	$.each(LNG.byId, function(index, value) {
		var elById = $('#' + index);
		if (typeof elById.attr('placeholder') !== typeof undefined && elById.attr('placeholder') !== false) {
			elById.attr('placeholder', value.replaceArray());
		} else {
			elById.html(value.replaceArray());
		}
	});
	$.each(LNG.byClass, function(index, value) {
		$('.' + index).html(value.replaceArray());
	});
	$('#boardAddAd').attr('href','https://' + BLOCKCHAIN.url + '/board/@' + BLOCKCHAIN.board_post_author + '/' + BLOCKCHAIN.board_post_permlink);
	showTab();
}

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
					$('#escrowData').fadeOut();
					steem.api.getAccountHistory(
							transaction.from,
							-1,
							200,
							function(err, response) {
								if(!err && response.length) {
									response.reverse();
									$.each(response, function(index, val) {
										if(val[1]['op'][0].search('escrow') == 0) {
											if(parseInt(val[1]['op'][1]['escrow_id']) == parseInt(transaction.escrow_id)) {
												$('#errorTransactionNotFound').append('<p><b>' + val[1]['op'][0] + '</b>: ' + JSON.stringify(val[1]['op'][1]) + '</p>');
											}
										}
									});
									$('span.transactionMeta').html(terms !== undefined ? terms.terms : JSON.stringify(terms));
								}
							}
					);
				} else if (typeof response == 'object') {
					$.each(response, function(index, value) {
						if(transaction[index] == undefined) {
							transaction[index] = value;
						}
					});

					if(transaction.steem_balance == '0.000 ' + BLOCKCHAIN.steem_ticker) {
						transaction.money = transaction.sbd_balance;
					} else {
						transaction.money = transaction.steem_balance;
					}

					var transactionDateExpire = new Date(transaction.escrow_expiration + 'Z');

					if(!transaction.agent_approved || !transaction.to_approved) {
						transaction.status = 'waitingForApproval';
					} else if (transaction.disputed) {
						transaction.status = 'disputeInitiated';
					} else if (transactionDateExpire < BLOCKCHAIN.time) {
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
					$('span.transactionFrom').html('<a target="_blank" href="https://' + BLOCKCHAIN.url + '/@' + transaction.from + '">@' + transaction.from + '</a>');
					$('span.transactionTo').html('<a target="_blank" href="https://' + BLOCKCHAIN.url + '/@' + transaction.to + '">@' + transaction.to + '</a>');
					$('span.transactionAgent').html('<a target="_blank" href="https://' + BLOCKCHAIN.url + '/@' + transaction.agent + '">@' + transaction.agent + '</a>');
					$('span.transactionMoney').html(transaction.money);
					$('span.transactionFee').html(transaction.pending_fee);
					$('span.transactionDate').html(transaction.escrow_expiration);
					$('span.transactionDeadline').html(transaction.ratification_deadline);

					var terms = '';
					steem.api.getAccountHistory(
							transaction.from,
							-1,
							100,
							function(err, response) {
								if(!err && response.length) {
									$.each(response, function(index, val) {
										if(val[1]['op'][0] == 'escrow_transfer') {
											if(parseInt(val[1]['op'][1]['escrow_id']) == parseInt(transaction.escrow_id)) {
												terms = $.parseJSON(val[1]['op'][1]['json_meta']);
											}
										}
									});
									$('span.transactionMeta').html(terms.terms !== undefined ? terms.terms : JSON.stringify(terms));
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
					//console.log(err, response);
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

function loadBoard() {
	steem.api.getContentReplies(BLOCKCHAIN.board_post_author, BLOCKCHAIN.board_post_permlink, function(err, result) {
		var orders = [],
			wrap = $('#boardBody'),
			messagesCount = 0,
			hrSkip = true;
		if(!err) {
			result.sort(function(a, b) {
				if (parseInt(a.author_reputation) < parseInt(b.author_reputation))
					return 1;
				if (parseInt(a.author_reputation) > parseInt(b.author_reputation))
					return -1;
				return 0;
			});

			console.log(result);
			$.each(result, function(index, val) {
				var lastUpdate = new Date(val.last_update + 'Z'),
					between = Date.hoursBetween(lastUpdate, BLOCKCHAIN.time),
					author_rep = calcRep(val.author_reputation),
					lines = val.body.split('\n'),
					html = '';

				if(between <= 72 && author_rep >= 50 && lines.length > 1) { // only 7 days old ads and reputation >= 50
					if(!hrSkip) {
						wrap.append('<hr>');
					}
					hrSkip = false;
					html += '<p class="boardMessageInfo"><a href="https://' + BLOCKCHAIN.url + '/@' +  val.author + '" target="_blank">@' + val.author + '</a>, ' + LNG.words.reputation + ' ' + author_rep + ', ' + LNG.words.advertWillDisappear + ' ' + (72 - between) + LNG.words.hourShort + '</a></p>';
					for (var i = 0; i < lines.length; i++) {
						if (i == 0) {
							html += '<h2><a href="https://' + BLOCKCHAIN.url + val.url + '" target="_blank">' + lines[i] + '</a></h2>';
						} else {
							html += '<p>';
							html += lines[i] + '</p>';
						}
					}

					$('<div/>', {
						class: 'order',
						html: html
					}).appendTo(wrap);
					messagesCount++;
				}
			});
			$('#tabBoard').append(' <span>' + messagesCount + '</span>');
		}
	});
}

$(function() {

	$('.switcher > a').click(function() {
		$(this).next('ul').slideToggle('fast');
		return false;
	});

	$('a.inputToggle').click(function() {
		if($(this).text() == BLOCKCHAIN.steem_ticker) {
			$('.inputToggle').text(BLOCKCHAIN.sbd_ticker);
		} else {
			$('.inputToggle').text(BLOCKCHAIN.steem_ticker);
		}
		return false;
	});

	$('ul#tabs > li > a').click(function() {
		switch($(this).attr('id')) {
			case 'tabSend':
				history.pushState('', LNG.byElement.title, '');
				break;
			case 'tabCP':
				if (!transaction.id) {
					transaction.id = prompt(LNG.words.enterId);
					if (!transaction.id) {
						return false;
					}
					window.location.href = '?id=' + transaction.id;
				} else {
					history.pushState('', LNG.byElement.title, '?id=' + transaction.id);
				}
				break;
			case 'tabBoard':
				history.pushState('', LNG.byId.tabBoard, '?tab=board&blockchain=' + BLOCKCHAIN.network);
				break;
		}
		$(this).parent().addClass('active').siblings().removeClass('active');
		$('div.tabWrapper').hide();
		$('div#' + $(this).data('div')).fadeIn();
		return false;
	});

	$('form#formSend').submit(function() {
		var btn = $(this),
		from = $('#inputSendLogin').val(),
		to = $('#inputSendReceiver').val(),
		wif = passToWif(from, $('#inputSendPassword').val()),
		agent = $('#sendAgent').val(),
		escrow_id = parseInt(Math.random() * (99999999 - 10000000) + 10000000),
		fee = parseFloat($('#sendAgent option:selected').data('fee')).toFixed(3) + ' ' + $('#aSendAmountUnit').text(),
		sbd_amount = '0.000 ' + BLOCKCHAIN.sbd_ticker,
		steem_amount = '0.000 ' + BLOCKCHAIN.steem_ticker,
		terms = {
			terms: $('#inputSendMeta').val()
		};

		if(!from || !to || !agent || !fee) {
			return false;
		}
		
		btn.prop('disabled', true);
		
		if($('#aSendAmountUnit').text() == BLOCKCHAIN.steem_ticker) {
			steem_amount = parseFloat($('#inputSendAmount').val().replace(',','.')).toFixed(3) + ' ' + BLOCKCHAIN.steem_ticker;
		} else if ($('#aSendAmountUnit').text() == BLOCKCHAIN.sbd_ticker) {
			sbd_amount = parseFloat($('#inputSendAmount').val().replace(',','.')).toFixed(3) + ' ' + BLOCKCHAIN.sbd_ticker;
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
				JSON.stringify(terms),
				function(err, response) {
					if(!err && response.ref_block_num) {
						if(from) {
							localStorage.setItem('escrow_login', from);
						}
						$('form#formSend').slideUp();
						$('#sendError').slideUp();
						$('#formSend').slideUp();
						$('#step2').slideDown();
						$('.sentLink').html('<a href="?id=' + from + '-' + escrow_id + '-' + BLOCKCHAIN.network + '">https://golosim.ru/escrow/?id=' + from + '-' + escrow_id + '-' + BLOCKCHAIN.network + '</a>');
						$('.sentId').html(from + '-' + escrow_id);
					} else {
						$('#sendError').html(LNG.byId.sendError);
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
		return false;
	});

	$('#escrowData').on('click', 'button', function() {
		$('#transactionType').val($(this).data('form'));
		$('form').hide();
		$('#' + $(this).data('form')).show();
		$('#sendTransaction').hide();
		$('#sendTransaction').slideDown('fast',function() {
			//$('html, body').scrollTop( $(document).height() );

			$('body').animate({
				scrollTop: $(document).height()
			}, 2000);

		});
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
		$(this).find('button').prop('disabled', true);
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
		$(this).find('button').prop('disabled', true);
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
		$(this).find('button').prop('disabled', true);
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
		$(this).find('button').prop('disabled', true);
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
		$(this).find('button').prop('disabled', true);
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
		$('#labelSendFeeAmout').html(LNG.byId.labelSendFeeAmout + ' <a href="https://' + BLOCKCHAIN.url + '/@' + agent + '" target="_blank">@' + agent + '</a>');
		$('#sendFeeAmout').val($('#sendAgent option:selected').data('fee'));
	});

	// добавляем гарантов из блокчейна, сортируем по репутации
	steem.api.getContentReplies(BLOCKCHAIN.agents_list_post_author, BLOCKCHAIN.agents_list_post_permlink, function(err, result) {
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
						if (matches && matches.length == 3) {
							$('#sendAgent').append('<option value="' + val.author + '" data-fee="' + parseFloat(matches[1]).toFixed(3) + '">' + val.author + ', ' + LNG.words.reputation + ' ' + calcRep(val.author_reputation) + ', ' + LNG.words.fee + ' ' + parseFloat(matches[1]).toFixed(3) + ', ' + matches[2] + '</option>');
						}
					}
				}
			});
			//$('#sendAgent').prop('disabled', false).change();
		}
	});

	var currentLanguage = gup('l');
	if(!currentLanguage) {
		currentLanguage = 'en-EN';
	}
	steem.api.getDynamicGlobalProperties(function(err, response) {
		BLOCKCHAIN.time = new Date(response.time + 'Z');
		BLOCKCHAIN.timeString = response.time;
		$.ajax({
			dataType: "json",
			url: 'l10n/' + currentLanguage + '.json',
			success: function(r) {
				LNG = r;
				changeLanguage();
			},
			error: function() {
				changeLanguage();
			}
		});
		changeLanguage(currentLanguage);
		loadBoard();
	});
});
