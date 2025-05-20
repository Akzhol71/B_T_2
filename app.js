// app.js

let tg = window.Telegram.WebApp;
tg.expand();

// 👇 ВАШ АКТУАЛЬНЫЙ URL ДЛЯ GOOGLE SCRIPT (убедитесь, что он правильный и развернут)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxz1dBeoo0ZxD65no4_jrYqslqoFYn93TrVXUbd2r5XNjkCN8ME5ipehBQug6IGoNSjHw/exec"; // ЗАМЕНИТЕ НА ВАШ АКТУАЛЬНЫЙ URL

const events = [
  {
    id: 1,
    title: "«Абай» операсы",
    place: "С.Сейфуллин атындағы қазақ драма театры",
    image: "https://raw.githubusercontent.com/Aibynz/Tiketon/refs/heads/main/image1.jpg"
  },
  {
    id: 2,
    title: "Ерлан Көкеев концерті",
    place: "Орталық концерт залы",
    image: "https://raw.githubusercontent.com/Aibynz/Tiketon/refs/heads/main/image2.jpg"
  },
  {
    id: 3,
    title: "«Қыз Жібек» спектаклі",
    place: "Жастар театры",
    image: "https://raw.githubusercontent.com/Aibynz/Tiketon/refs/heads/main/image3.jpg"
  }
];

const dateList = (() => {
  const now = new Date();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    dates.push(date.toISOString().split("T")[0]); // Формат YYYY-MM-DD
  }
  return dates;
})();

let selectedEvent = null;
let selectedSeats = [];
let selectedDate = "";
let selectedTime = "16:00"; // Значение по умолчанию для времени
let bookedSeats = []; // Массив для хранения ID занятых мест

const eventList = document.getElementById("eventList");
const bookingSection = document.getElementById("bookingSection");
const eventTitle = document.getElementById("eventTitle");
const seatTable = document.querySelector("#seatTable tbody");
const confirmBtn = document.getElementById("confirmBtn");
const dateSelect = document.getElementById("dateSelect");
const timeSelect = document.getElementById("timeSelect");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");

events.forEach(ev => {
  const card = document.createElement("div");
  card.className = "bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition";
  card.innerHTML = `
    <div class="p-4">
      <h3 class="text-lg font-bold text-blue-800">${ev.title}</h3>
      <p class="text-sm text-gray-600">${ev.place}</p>
      <img src="${ev.image || 'https://via.placeholder.com/150'}" alt="${ev.title}" class="w-full h-auto object-cover rounded mb-3">
      <button class="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        onclick="selectEvent(${ev.id})">
        Таңдау
      </button>
    </div>
  `;
  eventList.appendChild(card);
});

function selectEvent(id) {
  selectedEvent = events.find(e => e.id === id);
  selectedSeats = []; 
  bookedSeats = []; 
  eventTitle.textContent = selectedEvent.title + " | " + selectedEvent.place;
  bookingSection.classList.remove("hidden");

  dateSelect.innerHTML = "";
  dateList.forEach(dateStr => {
    const option = document.createElement("option");
    option.value = dateStr;
    const displayDate = new Date(dateStr).toLocaleDateString('kk-KZ', { day: 'numeric', month: 'long', year: 'numeric' });
    option.textContent = displayDate;
    dateSelect.appendChild(option);
  });
  selectedDate = dateList[0]; 
  dateSelect.value = selectedDate;

  selectedTime = timeSelect.options[0].value; 
  timeSelect.value = selectedTime;

  fetchBookedSeats();
}

dateSelect.onchange = () => {
  selectedDate = dateSelect.value;
  selectedSeats = []; 
  fetchBookedSeats();
};
timeSelect.onchange = () => {
  selectedTime = timeSelect.value;
  selectedSeats = []; 
  fetchBookedSeats();
};

async function fetchBookedSeats() {
  if (!selectedEvent || !selectedDate || !selectedTime) {
    console.warn("fetchBookedSeats: Не выбрано событие, дата или время. Карта мест не будет обновлена.");
    bookedSeats = []; // Сбрасываем, если нет данных для запроса
    drawSeatMap(); 
    return;
  }

  seatTable.innerHTML = '<tr><td colspan="11" class="p-4 text-center">Орындар жүктелуде...</td></tr>';
  
  const urlParams = new URLSearchParams({
      action: "getBookedSeats",
      title: selectedEvent.title,
      date: selectedDate,
      time: selectedTime
  });
  const requestUrl = `${GOOGLE_SCRIPT_URL}?${urlParams.toString()}`;
  
  console.log("ЗАПРОС К GOOGLE SCRIPT (fetchBookedSeats):", requestUrl);

  try {
    const response = await fetch(requestUrl);
    const responseDataText = await response.text(); 
    console.log("Ответ от Google Script (текст, fetchBookedSeats):", responseDataText);

    if (!response.ok) {
        let errorData;
        try { errorData = JSON.parse(responseDataText); } 
        catch (e) { errorData = { error: "Fetch error (fetchBookedSeats), could not parse JSON from error response", details: responseDataText }; }
        console.error("Сервер қатесі (Google Script) при fetchBookedSeats:", response.status, errorData);
        alert(`Орындар туралы ақпарат алу кезінде қате: ${errorData.error || response.statusText}. Толығырақ консольда.`);
        bookedSeats = []; // Считаем, что все свободно или произошла ошибка
    } else {
        try {
            const data = JSON.parse(responseDataText);
            console.log("Ответ от Google Script (JSON parsed, fetchBookedSeats):", data);
            if (data.success === false) { 
                 console.error("Google Script вернул success:false (fetchBookedSeats):", data.error, data.details);
                 alert(`Орындарды алу кезінде сервер қатесі: ${data.error || 'Белгісіз қате'}.`);
                 bookedSeats = [];
            } else {
                bookedSeats = data.booked || []; // Ожидаем массив строк ['1-қатар 1-орын', ...]
            }
        } catch (e) {
            console.error("Ошибка парсинга JSON от Google Script (fetchBookedSeats):", e, "Полученный текст:", responseDataText);
            alert("Орындар туралы ақпарат алу кезінде жауап форматы қате.");
            bookedSeats = [];
        }
    }
  } catch (err) {
    console.error("Орындарды алу кезінде желі немесе CORS қате (fetchBookedSeats):", err);
    alert("Орындарды алу кезінде желі қатесі немесе CORS саясатымен блоктау. Консольды тексеріңіз.");
    bookedSeats = []; // В случае ошибки считаем, что нет информации о занятых местах
  }
  console.log("Обработанные bookedSeats в app.js (после fetchBookedSeats):", JSON.stringify(bookedSeats));
  drawSeatMap();
}

function drawSeatMap() {
  seatTable.innerHTML = "";
  console.log("drawSeatMap вызвана. bookedSeats:", JSON.stringify(bookedSeats), "selectedSeats:", JSON.stringify(selectedSeats));
  for (let row = 1; row <= 10; row++) {
    const tr = document.createElement("tr");
    const rowLabel = document.createElement("td");
    rowLabel.textContent = `${row}-қатар`;
    rowLabel.className = "p-1 font-medium bg-gray-100 text-xs sm:text-sm text-center";
    tr.appendChild(rowLabel);

    for (let col = 1; col <= 10; col++) {
      const seatId = `${row}-қатар ${col}-орын`;
      const td = document.createElement("td");
      td.textContent = col;
      td.dataset.seatId = seatId;
      let baseClasses = "p-2 border text-xs sm:text-sm text-center ";

      if (bookedSeats.includes(seatId)) {
        td.className = baseClasses + "bg-red-300 text-gray-600 cursor-not-allowed";
        td.title = "Бұл орын бос емес";
      } else {
        td.className = baseClasses + "cursor-pointer bg-gray-50 hover:bg-green-300";
        td.onclick = () => toggleSeat(td, seatId);
        if (selectedSeats.includes(seatId)) {
          td.classList.remove("bg-gray-50", "hover:bg-green-300");
          td.classList.add("bg-green-500", "text-white");
        }
      }
      tr.appendChild(td);
    }
    seatTable.appendChild(tr);
  }
}

function toggleSeat(td, seatId) {
  const index = selectedSeats.indexOf(seatId);
  if (index > -1) {
    selectedSeats.splice(index, 1);
    td.classList.remove("bg-green-500", "text-white");
    td.classList.add("bg-gray-50", "hover:bg-green-300");
  } else {
    selectedSeats.push(seatId);
    td.classList.remove("bg-gray-50", "hover:bg-green-300");
    td.classList.add("bg-green-500", "text-white");
  }
}

confirmBtn.onclick = async () => {
  const customerName = customerNameInput.value.trim();
  const customerPhone = customerPhoneInput.value.trim();

  if (!selectedEvent || selectedSeats.length === 0 || !customerName || !customerPhone) {
    alert("Барлық өрістерді толтырыңыз және кемінде бір орынды таңдаңыз.");
    if (!customerName) customerNameInput.focus();
    else if (!customerPhone) customerPhoneInput.focus();
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = "Тексеру...";

  let currentBookedSeatsCheck;
  try {
    const checkUrlParams = new URLSearchParams({
        action: "getBookedSeats",
        title: selectedEvent.title,
        date: selectedDate,
        time: selectedTime
    });
    const checkRequestUrl = `${GOOGLE_SCRIPT_URL}?${checkUrlParams.toString()}`;
    console.log("ЗАПРОС К GOOGLE SCRIPT (confirmBtn check):", checkRequestUrl);

    const responseCheck = await fetch(checkRequestUrl);
    const responseDataTextCheck = await responseCheck.text();
    console.log("Ответ от Google Script при проверке (текст, confirmBtn):", responseDataTextCheck);

    if (!responseCheck.ok) {
        let errorDataCheck;
        try { errorDataCheck = JSON.parse(responseDataTextCheck); }
        catch (e) { errorDataCheck = { error: "Fetch error during confirm, could not parse JSON", details: responseDataTextCheck }; }
        console.error("Сервер қатесі (Google Script) при проверке мест (confirmBtn):", responseCheck.status, errorDataCheck);
        alert(`Орындарды тексеру кезінде қате: ${errorDataCheck.error || responseCheck.statusText}.`);
        confirmBtn.disabled = false;
        confirmBtn.textContent = "📩 Брондау";
        return;
    }
    
    try {
        const dataCheck = JSON.parse(responseDataTextCheck);
        console.log("Ответ от Google Script при проверке (JSON parsed, confirmBtn):", dataCheck);
        if (dataCheck.success === false) {
            console.error("Google Script вернул success:false при проверке (confirmBtn):", dataCheck.error, dataCheck.details);
            alert(`Орындарды тексеру кезінде сервер қатесі: ${dataCheck.error || 'Белгісіз қате'}.`);
            confirmBtn.disabled = false;
            confirmBtn.textContent = "📩 Брондау";
            return;
        }
        currentBookedSeatsCheck = dataCheck.booked || [];
    } catch (e) {
        console.error("Ошибка парсинга JSON от Google Script при проверке (confirmBtn):", e, "Полученный текст:", responseDataTextCheck);
        alert("Орындарды тексеру кезінде жауап форматы қате.");
        confirmBtn.disabled = false;
        confirmBtn.textContent = "📩 Брондау";
        return;
    }

    console.log("Места, выбранные пользователем (confirmBtn):", JSON.stringify(selectedSeats));
    console.log("Занятые места с сервера при проверке (confirmBtn):", JSON.stringify(currentBookedSeatsCheck));

    const newlyBookedByOthers = selectedSeats.filter(seat => currentBookedSeatsCheck.includes(seat));

    if (newlyBookedByOthers.length > 0) {
      alert(`Кешіріңіз, келесі орындар ('${newlyBookedByOthers.join(', ')}') сіз таңдау жасап жатқанда брондалып кетті немесе қазір қолжетімсіз. Тапсырыс жаңартылады, басқа орындарды таңдаңыз.`);
      bookedSeats = currentBookedSeatsCheck; // Обновляем глобальный bookedSeats
      selectedSeats = selectedSeats.filter(seat => !newlyBookedByOthers.includes(seat)); // Убираем занятые из выбранных
      drawSeatMap();
      confirmBtn.disabled = false;
      confirmBtn.textContent = "📩 Брондау";
      return;
    }

    const dataToSend = {
      event: {
          id: selectedEvent.id,
          title: selectedEvent.title,
          place: selectedEvent.place,
          image: selectedEvent.image
      },
      seats: selectedSeats,
      date: selectedDate,
      time: selectedTime,
      customerName: customerName,
      customerPhone: customerPhone
    };

    console.log("Отправка данных в Telegram:", JSON.stringify(dataToSend));
    tg.sendData(JSON.stringify(dataToSend));
    // Не сбрасываем кнопку здесь, т.к. ожидаем закрытие WebApp или переход к оплате
    // confirmBtn.disabled = false;
    // confirmBtn.textContent = "📩 Брондау";

  } catch (err) {
    console.error("Брондау кезінде қате (общий catch в confirmBtn):", err);
    alert("Брондау кезінде қате орын алды. Интернет байланысыңызды тексеріп, қайталап көріңіз.");
    confirmBtn.disabled = false;
    confirmBtn.textContent = "📩 Брондау";
  }
};

if (events.length > 0) {
  selectEvent(events[0].id);
}
