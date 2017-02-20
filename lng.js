var currentLanguage = 'ru';

function gup( name ) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null )
		return "";
	else {
		return results[1];
	}
}

var blockchain = gup('blockchain'),
	transaction = {
		id: gup('id')
	}, parts;

if(blockchain) {
	if(blockchain == 'GOLOS') {
		currentLanguage = 'ru';
	} else if(blockchain == 'STEEM') {
		currentLanguage = 'en';
	}
} else {
	if (transaction.id.match(/^[a-z0-9\.\-]+-[\d]+-[steem|golos]+$/)) {
		parts = transaction.id.split('-');
		transaction.from = parts[0];
		transaction.escrow_id = parts[1];
		if (parts[2] !== undefined) {
			if (parts[2] == 'steem') {
				currentLanguage = 'en';
			}
		}
	} else {
		transaction.id = null;
	}
}

LNG = {
	words: {
		fee: {
			ru: 'комиссия',
			en: 'fee'
		},
		reputation: {
			ru: 'репутация',
			en: 'reputation'
		},
		enterId: {
			ru: 'Введите ID транзакции, например xtar-8724723-golos:',
			en: 'Enter transaction ID, for example xtar-8724723-steem:'
		}
	},
	options: {
		network: {
			ru: 'golos',
			en: 'steem'
		},
		websocket: {
			ru: 'wss://ws.golos.io',
			en: 'wss://steemd.steemit.com'
		},
		address_prefix: {
			ru: 'GLS',
			en: 'STM'
		},
		chain_id: {
			ru: "782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12",
			en: '0000000000000000000000000000000000000000000000000000000000000000'
		},
		steem_simbol: {
			ru: 'GOLOS',
			en: 'STEEM'
		},
		sbd_simbol: {
			ru: 'GBG',
			en: 'SBD'
		},
		url: {
			ru: 'golos.io',
			en: 'steemit.com'
		},
		agents_list_post_author: {
			ru: 'xtar',
			en: 'xtar'
		},
		agents_list_post_permlink: {
			ru: 'khochesh-stat-garantom-bud-im',
			en: 'escrow-agents-homepage'
		}
	},
	byElement: {
		title: {
			ru: 'Отправка GOLOS/GBG с гарантом',
			en: 'Send STEEM/SBD with escrow'
		}
	},
	byId: {
		tabSwitchGolosSteem: {
			ru: '<a href="?blockchain=STEEM">Switch to STEEM</a>',
			en: '<a href="?blockchain=GOLOS">Switch to GOLOS</a>'
		},
		tabSend: {
			ru: 'Отправить GOLOS/GBG',
			en: 'Send STEEM/SBD'
		},
		tabCP: {
			ru: 'Панель управления транзакцией',
			en: 'Transaction CP'
		},
		labelLogin: {
			ru: 'Введите Ваши логин и пароль / Active WIF:',
			en: 'Your login and password / Active WIF:'
		},
		inputSendLogin: {
			ru: 'Ваш логин',
			en: 'Your login'
		},
		inputSendPassword: {
			ru: 'Ваш пароль / Active WIF',
			en: 'Your password / Active WIF'
		},
		labelReceiver: {
			ru: 'Введите логин получателя платежа:',
			en: "Receiver's login:"
		},
		inputSendReceiver: {
			ru: 'Логин получателя',
			en: "Receiver's login"
		},
		labelAmount: {
			ru: 'Введите сумму для отправки',
			en: 'Enter amount:'
		},
		labelAgent: {
			ru: 'Выберите гаранта. Чтоб попасть в этот список, отписываемся <a href="https://golos.io/nsfw/@xtar/khochesh-stat-garantom-bud-im" target="_blank">вот тут</a>, сортировка списка по репутации гарантов:',
			en: 'Choose escrow agent. To become agent post comment <a href="https://steemit.com/test/@xtar/escrow-agents-homepage">here</a> (sort by agent reputation).'
		},
		selectOptionChooseAgent: {
			ru: 'Выберите гаранта...',
			en: 'Choose agent from list'
		},
		labelSendFeeAmout: {
			ru: 'Комиссия от',
			en: 'Fee by'
		},
		inputSendAmount: {
			ru: 'Сумма, для переключения GOLOS/GBG кликни справа',
			en: 'Amount, click to toggle STEEM/SBD'
		},
		labelDeadline: {
			ru: 'Укажите срок, втечение которого получатель и гарант должны дать свое согласие на совершение данной сделки. Если они не успеют этого сделать, средства автоматически вернутся на счет отправителя:',
			en: 'Approve deadline date. If receiver or agent will not approve before deadline, funds will return to sender:'
		},
		labelEscrowEndDate: {
			ru: 'Укажите срок действия гаранта, по истечении которого любая из сторон сможет принять любое решение (либо забрать деньги себе, либо отправить второй стороне). Этот срок не может быть меньше предыдущего:',
			en: 'Escrow expiration date. After this date sender and reciever may take funds to themself or send to another side.'
		},
		labelTransactionTerms: {
			ru: 'Условия сделки (не обязательно, но крайне желательно)',
			en: 'Terms of a transaction (optional)'
		},
		inputSendMeta: {
			ru: 'Будут нужны в случае возникновения спорной ситуации',
			en: 'They will be needed in the event of a dispute'
		},
		tdTransactionId: {
			ru: 'id транзакции',
			en: 'Transaction id'
		},
		tdSender: {
			ru: 'Отправитель',
			en: 'Sender'
		},
		tdReceiver: {
			ru: 'Получатель',
			en: 'Receiver'
		},
		tdAmount: {
			ru: 'Сумма',
			en: 'Amount'
		},
		tdAgent: {
			ru: 'Гарант',
			en: 'Agent'
		},
		tdEscrowFee: {
			ru: 'Комиссия гаранта',
			en: 'Agent fee'
		},
		tdDeadlineDate: {
			ru: 'Дата и время закрытия сделки',
			en: 'Escrow Deadline Date'
		},
		tdCurrentDate: {
			ru: 'Текущая дата и время в блокчейне',
			en: 'Current blockchain date'
		},
		tdMeta: {
			ru: 'Условия сделки',
			en: 'Terms of a transaction'
		},
		actionSenderWaitingForApproval: {
			ru: 'Отправитель ожидает, пока получатель и гарант дадут свое согласие на совершение данной сделки. Если до <span class="transactionDeadline"></span> хоть одна из сторон не согласится, средства автоматически вернутся отправителю.',
			en: 'Sender waiting for approval from receiver and agent. It someone will not approve before <span class="transactionDeadline"></span> the funds will return to sender'
		},
		actionSenderApprovalReceived: {
			ru: 'Отправитель может либо отправить средства получателю, либо оспорить сделку:',
			en: 'Sender can send funds to receiver or start dispute:'
		},
		actionSenderWaitingEscrow: {
			ru: 'Отправитель ожидает принятия решения гарантом.',
			en: 'Sender waiting for escrow agent decision.'
		},
		actionSenderEscrowExpired: {
			ru: 'Срок действия гаранта истёк',
			en: 'Escrow time was ended'
		},
		actionReceiverWaitingForApproval: {
			ru: 'Получатель должен решить, согласен он с условиями сделки или нет:',
			en: 'Receiver must approve or disapprove deal:'
		},
		actionReceiverApprovalReceived: {
			ru: 'Получатель может либо вернуть средства отправителю, либо оспорить сделку:',
			en: 'Receiver can send funds back to sender or start dispute:'
		},
		actionReceiverWaitingEscrow: {
			ru: 'Получатель ожидает принятия решения гарантом.',
			en: 'Receiver waiting for escrow agent decision.'
		},
		actionReceiverEscrowExpired: {
			ru: 'Срок действия гаранта истёк',
			en: 'Escrow time was ended'
		},
		agentWaitingForApproval: {
			ru: 'Гарант должен решить, согласен он с условиями сделки или нет:',
			en: 'Escrow agent must to approve or disapprove deal:'
		},
		agentApprovalRecieved: {
			ru: 'Пока нет спорной ситуации, гарант ничего не делает.',
			en: 'Escrow agent do nothing till dispute will started.'
		},
		agentEscrowExpired: {
			ru: 'Срок действия гаранта истёк. Теперь любая из сторон может принять любое решение.',
			en: 'Deal escrow expired. Now anybody can take funds or send to another side.'
		},
		labelAction: {
			ru: 'Действие',
			en: 'Action'
		},
		actionApproveForm: {
			ru: 'Дать согласие (или отказ) на условия сделки',
			en: 'Approve or disapprove deal'
		},
		actionReleaseForm: {
			ru: 'Отправить средства получателю',
			en: 'Send funds to receiver'
		},
		actionCancelForm: {
			ru: 'Отменить сделку и отправить деньги отправителю',
			en: 'Cancel deal and return funds to sender'
		},
		actionStartDisputeForm: {
			ru: 'Оспорить сделку',
			en: 'Start dispute'
		},
		actionEscrowForm: {
			ru: 'Гарант решит, кому отправить средства',
			en: 'Escrow agent decision'
		},
		actionExpiredForm: {
			ru: 'Срок действия гаранта истек, забираю средства себе',
			en: "Escrow date expired, i'm taking funds to me"
		},
		actionLoginPassword: {
			ru: 'Введите Ваши логин и пароль / Active WIF',
			en: 'Enter your login and password / Active WIF'
		},
		inputActionLogin: {
			ru: 'Ваш логин',
			en: 'Your login'
		},
		inputActionPassword: {
			ru: 'Ваш пароль / Active WIF',
			en: 'Your password / Active WIF'
		},
		actionApproveFormYes: {
			ru: 'Да, с условиями согласен, продолжить сделку',
			en: 'Yes, approve deal'
		},
		actionApproveFormNo: {
			ru: 'Нет, с условиями не согласен, отменить сделку',
			en: 'No, disapprove and cancel deal'
		},
		errorTransactionNotFound: {
			ru: '<strong>Ошибка!</strong> Активный ордер с данным ID не найден в блокчейне.',
			en: '<strong>Error!</strong> Active order with this ID not found in blockchain.'
		}
	}, byClass: {
		inputToggle: {
			ru: 'GOLOS',
			en: 'STEEM'
		},
		selectOption3hours: {
			ru: '3 часа',
			en: '3 hours'
		},
		selectOption6hours: {
			ru: '6 часов',
			en: '6 hours'
		},
		selectOption12hours: {
			ru: '12 часов',
			en: '12 hours'
		},
		selectOption24hours: {
			ru: '24 часа',
			en: '24 hours'
		},
		selectOption2days: {
			ru: '2 дня',
			en: '2 days'
		},
		selectOption4days: {
			ru: '4 дня',
			en: '4 days'
		},
		selectOption1week: {
			ru: '1 неделя',
			en: '1 week'
		},
		selectOption2week: {
			ru: '1 неделя',
			en: '2 weeks'
		},
		selectOption3week: {
			ru: '3 неделя',
			en: '3 weeks'
		},
		selectOption1month: {
			ru: '1 месяц',
			en: '1 month'
		},
		selectOption2month: {
			ru: '2 месяца',
			en: '2 month'
		},
		selectOption6month: {
			ru: '6 месяцев',
			en: '6 month'
		},
		selectOption1year: {
			ru: '1 год',
			en: '1 year'
		},
		wordLoading: {
			ru: 'Загрузка...',
			en: 'Loading...'
		},
		buttonStartDispute: {
			ru: 'Оспорить сделку',
			en: 'Start dispute'
		},
		buttonSendFundsToReceiver: {
			ru: 'Отправить средства получателю',
			en: 'Send funds to receiver'
		},
		buttonTakeFunds: {
			ru: 'Заберать средства себе',
			en: 'Take funds to me'
		},
		buttonDisapproveDeal: {
			ru: 'Не согласен (отменить сделку)',
			en: 'Disapprove and cancel deal'
		},
		buttonApproveDeal: {
			ru: 'Согласен',
			en: 'Approve deal'
		},
		buttonSendFundsToSender: {
			ru: 'Вернуть средства отправителю',
			en: 'Send funds back to sender'
		},
		buttonSendSubmit: {
			ru: 'Отправить',
			en: 'Send'
		}
	}
};