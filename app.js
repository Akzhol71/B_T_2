<!DOCTYPE html>
<html lang="kk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Билет брондау</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body class="bg-white text-gray-800">
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-6 text-blue-700">Қарағанды мәдени іс-шаралары</h1>
    <div id="eventList" class="grid md:grid-cols-2 gap-6"></div>

    <div id="bookingSection" class="hidden mt-8">
      <h2 class="text-xl font-semibold mb-4 text-center" id="eventTitle"></h2>

      <label class="block mb-1 font-medium">Күні таңдаңыз:</label>
      <select id="dateSelect" class="w-full p-2 border mb-3 rounded"></select>

      <label class="block mb-1 font-medium">Уақыты таңдаңыз:</label>
      <select id="timeSelect" class="w-full p-2 border mb-4 rounded">
        <option value="16:00">16:00</option>
        <option value="19:00">19:00</option>
      </select>

      <h3 class="mb-2 font-medium">Орын таңдаңыз:</h3>
      <div class="overflow-x-auto border rounded">
        <table class="table-auto w-full text-center" id="seatTable">
          <tbody></tbody>
        </table>
      </div>

      <div class="mt-4">
        <label for="customerName" class="block mb-1 font-medium">Аты-жөніңіз:</label>
        <input type="text" id="customerName" name="customerName" class="w-full p-2 border mb-3 rounded" required placeholder="Мысалы, Әлихан Нұрмұхамед">
      </div>
      <div>
        <label for="customerPhone" class="block mb-1 font-medium">Телефон нөміріңіз:</label>
        <input type="tel" id="customerPhone" name="customerPhone" class="w-full p-2 border mb-4 rounded" required placeholder="+7 (7XX) XXX-XX-XX">
      </div>

      <button id="confirmBtn"
              class="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold text-lg transition">
        📩 Брондау
      </button>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
