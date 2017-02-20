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
		transaction.escrow_id = parseInt(parts[1]);
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
			en: 'Transaction Control Panel'
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
			en: "Enter the recipient's username:"
		},
		inputSendReceiver: {
			ru: 'Логин получателя',
			en: "Receiver's login"
		},
		labelAmount: {
			ru: 'Введите сумму для отправки',
			en: 'Amount to send:'
		},
		labelAgent: {
			ru: 'Выберите гаранта. Чтоб попасть в этот список, отписываемся <a href="https://golos.io/nsfw/@xtar/khochesh-stat-garantom-bud-im" target="_blank">вот тут</a>, сортировка списка по репутации гарантов:',
			en: 'Choose the escrow agent. To become an agent, post a comment <a href="https://steemit.com/test/@xtar/escrow-agents-homepage">here</a> (sorted by agent reputation).'
		},
		selectOptionChooseAgent: {
			ru: 'Выберите гаранта...',
			en: 'Choose an agent from the list'
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
			en: 'Specify the period within which the recipient and the escrow must agree to commit the transaction. If they don''t approve the transaction before the deadline, the funds will be automatically returned to the sender:'
		},
		labelEscrowEndDate: {
			ru: 'Укажите срок действия гаранта, по истечении которого любая из сторон сможет принять любое решение (либо забрать деньги себе, либо отправить второй стороне). Этот срок не может быть меньше предыдущего:',
			en: 'Specify the warranty expiration period after which either party can take any action (either take the money or send the other party). This period cannot be less than the previous one:'
		},
		labelTransactionTerms: {
			ru: 'Условия сделки (не обязательно, но крайне желательно)',
			en: 'Terms of the transaction (optional, but highly recommended)'
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
			en: 'Terms of transaction'
		},
		actionSenderWaitingForApproval: {
			ru: 'Отправитель ожидает, пока получатель и гарант дадут свое согласие на совершение данной сделки. Если до <span class="transactionDeadline"></span> хоть одна из сторон не согласится, средства автоматически вернутся отправителю.',
			en: 'Sender is waiting for approval from receiver and agent. If nobody approves the transaction before <span class="transactionDeadline"></span>, the funds will be returned to the sender'
		},
		actionSenderApprovalReceived: {
			ru: 'Отправитель может либо отправить средства получателю, либо оспорить сделку:',
			en: 'Sender can either send the funds to the receiver or start a dispute:'
		},
		actionSenderWaitingEscrow: {
			ru: 'Отправитель ожидает принятия решения гарантом.',
			en: 'Sender waiting for escrow agent decision.'
		},
		actionSenderEscrowExpired: {
			ru: 'Срок действия гаранта истёк',
			en: 'Escrow warranty period expired'
		},
		actionReceiverWaitingForApproval: {
			ru: 'Получатель должен решить, согласен он с условиями сделки или нет:',
			en: 'Receiver must approve or disapprove the transaction:'
		},
		actionReceiverApprovalReceived: {
			ru: 'Получатель может либо вернуть средства отправителю, либо оспорить сделку:',
			en: 'Receiver can send funds back to the sender or start a dispute:'
		},
		actionReceiverWaitingEscrow: {
			ru: 'Получатель ожидает принятия решения гарантом.',
			en: 'Receiver waiting for escrow agent decision.'
		},
		actionReceiverEscrowExpired: {
			ru: 'Срок действия гаранта истёк',
			en: 'Escrow warranty period expired'
		},
		agentWaitingForApproval: {
			ru: 'Гарант должен решить, согласен он с условиями сделки или нет:',
			en: 'Escrow agent must approve or disapprove the transaction:'
		},
		agentApprovalRecieved: {
			ru: 'Пока нет спорной ситуации, гарант ничего не делает.',
			en: 'No dispute yet. Escrow agent has nothing to do.'
		},
		agentEscrowExpired: {
			ru: 'Срок действия гаранта истёк. Теперь любая из сторон может принять любое решение.',
			en: 'Escrow warranty period expired. Now, anybody can take the funds or send them to the other party.'
		},
		labelAction: {
			ru: 'Действие',
			en: 'Action'
		},себе
		actionApproveForm: {
			ru: 'Дать согласие (или отказ) на условия сделки',
			en: 'Approve or disapprove transaction'
		},
		actionReleaseForm: {
			ru: 'Отправить средства получателю',
			en: 'Send funds to receiver'
		},
		actionCancelForm: {
			ru: 'Отменить сделку и отправить деньги отправителю',
			en: 'Cancel transaction and return funds to the sender'
		},
		actionStartDisputeForm: {
			ru: 'Оспорить сделку',
			en: 'Start a dispute'
		},
		actionEscrowForm: {
			ru: 'Гарант решит, кому отправить средства',
			en: 'Escrow agent decision'
		},
		actionExpiredForm: {
			ru: 'Срок действия гаранта истек, забираю средства себе',
			en: "Escrow warranty period expired, I keep the funds for me"
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
			en: 'Yes, approve transaction'
		},
		actionApproveFormNo: {
			ru: 'Нет, с условиями не согласен, отменить сделку',
			en: 'No, disapprove and cancel transaction'
		},
		errorTransactionNotFound: {
			ru: '<strong>Ошибка!</strong> Активный ордер с данным ID не найден в блокчейне.',
			en: '<strong>Error!</strong> No active order with this ID in the blockchain.'
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
			en: 'Disapprove and cancel transaction'
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
