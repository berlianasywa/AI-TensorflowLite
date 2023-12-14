// Array untuk menyimpan riwayat kata dan hasilnya
const history = [];

// Flag to check if "Final Result" is displayed
let finalResultDisplayed = false;

// Fungsi untuk mengklasifikasikan review
async function classifyMovieReview() {
  const textarea = document.getElementById("reviewInput");
  const resultDiv = document.querySelector(".result");
  const historyContainer = document.querySelector(".history-container");

  // Ambil review dari textarea
  const review = textarea.value;

  // Pastikan review tidak kosong sebelum melanjutkan
  if (review.trim() === "") {
    alert("Please enter a movie review.");
    return;
  }

  // Load model TFLite
  const model = await tfTask.NLClassification.CustomModel.TFLite.load({
    model:
      "https://storage.googleapis.com/tfweb/models/movie_review_sentiment_classification.tflite"
  });

  // Reset history if "Final Result" is displayed
  if (finalResultDisplayed) {
    history.length = 0;
    finalResultDisplayed = false;
  }

  // Prediksi hasil dari review
  const result = await model.predict(review);

  // Tambahkan hasil ke riwayat
  history.push({ review, result: result.classes });

  // Tampilkan hasil terkini
  resultDiv.textContent = result.classes
    .map((c) => `${c.className}: ${c.score.toFixed(3)}`)
    .join(", ");

  // Tampilkan riwayat di historyContainer
  displayHistory();

  // Jika jumlah elemen di riwayat mencapai 10, hitung rata-rata hasil
  if (history.length === 10) {
    calculateAverageResult();
  }
}

// Fungsi untuk menampilkan riwayat di HTML
function displayHistory() {
  const historyContainer = document.querySelector(".history-container");

  // Bersihkan konten sebelum menampilkan riwayat
  historyContainer.innerHTML = "<h2>History</h2>";

  // Loop melalui riwayat dan tambahkan ke konten HTML
  history.forEach((item, index) => {
    const historyItem = document.createElement("div");
    historyItem.classList.add("history-item");
    historyItem.innerHTML = `<strong>${index === 10 ? "Final Result" : "Review"} ${index + 1}:</strong> ${item.review}<br><strong>Result:</strong> ${item.result.map(c => `${c.className}: ${c.score.toFixed(3)}`).join(", ")}<br><br>`;

    historyContainer.appendChild(historyItem);
  });
}

// Fungsi untuk menghitung rata-rata hasil dari riwayat
function calculateAverageResult() {
  const historyContainer = document.querySelector(".history-container");

  // Set flag to indicate "Final Result" is displayed
  finalResultDisplayed = true;

  // Buat container untuk "Final Result"
  const finalResultContainer = document.createElement("div");
  finalResultContainer.classList.add("history-item", "final-result-container");

  const totalResults = history.reduce((acc, item) => acc + item.result[0].score, 0);
  const averageScore = (totalResults / 10).toFixed(3);

  // Tambahkan hasil rata-rata ke riwayat dengan label "Final Result"
  history.push({ review: "Final Result", result: [{ className: "Average", score: parseFloat(averageScore) }] });

  // Tambahkan "Final Result" ke container
  const finalResultItem = document.createElement("div");
  finalResultItem.innerHTML = `<strong>Final Result:</strong> ${history[10].result.map(c => `${c.className}: ${c.score.toFixed(3)}`).join(", ")}`;
  finalResultContainer.appendChild(finalResultItem);

  // Loop melalui riwayat (tanpa "Final Result") dan tambahkan ke konten HTML
  for (let index = 0; index < 10; index++) {
    const item = history[index];
    const historyItem = document.createElement("div");
    historyItem.classList.add("history-item");
    historyItem.innerHTML = `<strong>Review ${index + 1}:</strong> ${item.review}<br><strong>Result:</strong> ${item.result.map(c => `${c.className}: ${c.score.toFixed(3)}`).join(", ")}`;
    historyContainer.appendChild(historyItem);
  }

  // Tambahkan "Final Result" container ke historyContainer
  historyContainer.appendChild(finalResultContainer);
}
