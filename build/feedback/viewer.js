document.addEventListener('DOMContentLoaded', () => {
    const feedbackList = document.getElementById('feedback-list');
    const filters = document.querySelectorAll('input[name="filter"]');

    function renderFeedback(feedbacks) {
        feedbackList.innerHTML = '';
        feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        feedbacks.forEach(feedback => {
            const div = document.createElement('div');
            div.className = `feedback-item ${feedback.checked ? 'checked' : ''}`;
            let content = `<p><strong>Тип:</strong> ${feedback.type === 'add' ? 'Добавить' : feedback.type === 'edit' ? 'Исправить' : 'Отзыв'}</p>`;
            content += `<p><strong>Дата:</strong> ${new Date(feedback.timestamp).toLocaleString('ru')}</p>`;
            content += `<p><strong>Проверено:</strong> ${feedback.checked ? 'Да' : 'Нет'}</p>`;

            switch (feedback.type) {
                case 'add':
                    content += `
                        <p><strong>Название:</strong> ${feedback.name}</p>
                        <p><strong>Описание:</strong> ${feedback.description}</p>
                        <p><strong>Карта:</strong> <a href="${feedback.maps_url}" target="_blank">${feedback.maps_url}</a></p>
                    `;
                    if (feedback.is_owner) {
                        content += `
                            <p><strong>Владелец:</strong> Да</p>
                            <p><strong>Контакт:</strong> ${feedback.contact}</p>
                        `;
                    }
                    break;
                case 'edit':
                    content += `
                        <p><strong>Место:</strong> ${feedback.place}</p>
                        <p><strong>Предложение:</strong> ${feedback.suggestion}</p>
                    `;
                    if (feedback.is_owner) {
                        content += `
                            <p><strong>Владелец:</strong> Да</p>
                            <p><strong>Контакт:</strong> ${feedback.contact}</p>
                        `;
                    }
                    break;
                case 'feedback':
                    content += `<p><strong>Сообщение:</strong> ${feedback.message}</p>`;
                    if (feedback.contact) {
                        content += `<p><strong>Контакт:</strong> ${feedback.contact}</p>`;
                    }
                    break;
            }

            div.innerHTML = content;
            feedbackList.appendChild(div);
        });
    }

    function loadFeedback() {
        fetch('./feedback.json')
            .then(response => response.json())
            .then(data => {
                const filter = document.querySelector('input[name="filter"]:checked').value;
                let filteredData = data;
                if (filter === 'checked') {
                    filteredData = data.filter(f => f.checked);
                } else if (filter === 'unchecked') {
                    filteredData = data.filter(f => !f.checked);
                }
                renderFeedback(filteredData);
            })
            .catch(error => {
                console.error('Error loading feedback:', error);
                feedbackList.innerHTML = '<p>Ошибка загрузки отзывов</p>';
            });
    }

    filters.forEach(filter => {
        filter.addEventListener('change', loadFeedback);
    });

    loadFeedback();
});
