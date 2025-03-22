document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedback-form');
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const addForm = document.querySelector('.add-form');
    const editForm = document.querySelector('.edit-form');
    const feedbackForm = document.querySelector('.feedback-form');
    const successMessage = document.getElementById('success-message');
    const placeSelect = editForm.querySelector('select[name="place"]');
    const placeInfo = editForm.querySelector('.place-info');

    // Функция для управления атрибутами required
    function updateRequiredFields(activeSection) {
        // Убираем required у всех полей
        const allRequiredFields = form.querySelectorAll('[required]');
        allRequiredFields.forEach(field => field.removeAttribute('required'));

        // Добавляем required только для активной секции
        if (activeSection === 'add') {
            addForm.querySelector('input[name="name"]').setAttribute('required', '');
            addForm.querySelector('textarea[name="description"]').setAttribute('required', '');
            addForm.querySelector('input[name="maps_url"]').setAttribute('required', '');
            const isOwner = addForm.querySelector('input[name="is_owner"]').checked;
            if (isOwner) {
                addForm.querySelector('input[name="contact"]').setAttribute('required', '');
            }
        } else if (activeSection === 'edit') {
            editForm.querySelector('select[name="place"]').setAttribute('required', '');
            editForm.querySelector('textarea[name="suggestion"]').setAttribute('required', '');
            const isOwner = editForm.querySelector('input[name="is_owner"]').checked;
            if (isOwner) {
                editForm.querySelector('input[name="contact"]').setAttribute('required', '');
            }
        } else if (activeSection === 'feedback') {
            feedbackForm.querySelector('textarea[name="message"]').setAttribute('required', '');
        }
    }

    // Загружаем места из places.json
    fetch('../data/places.json')
        .then(response => response.json())
        .then(places => {
            places.forEach(place => {
                const option = document.createElement('option');
                option.value = place.name;
                option.textContent = place.name;
                placeSelect.appendChild(option);
            });
        });

    // Показываем информацию о месте при выборе
    placeSelect.addEventListener('change', (e) => {
        fetch('../data/places.json')
            .then(response => response.json())
            .then(places => {
                const place = places.find(p => p.name === e.target.value);
                if (place) {
                    placeInfo.innerHTML = `
                        <img src="${place.image}" alt="${place.name}">
                        <div>
                            <h3>${place.name}</h3>
                            <p>${place.description}</p>
                        </div>
                    `;
                    placeInfo.classList.remove('hidden');
                }
            });
    });

    // Переключение форм и обновление required
    typeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            form.classList.remove('hidden');
            addForm.classList.add('hidden');
            editForm.classList.add('hidden');
            feedbackForm.classList.add('hidden');

            let activeSection = '';
            switch (radio.value) {
                case 'add':
                    addForm.classList.remove('hidden');
                    activeSection = 'add';
                    break;
                case 'edit':
                    editForm.classList.remove('hidden');
                    activeSection = 'edit';
                    break;
                case 'feedback':
                    feedbackForm.classList.remove('hidden');
                    activeSection = 'feedback';
                    break;
            }
            updateRequiredFields(activeSection);
        });
    });

    // Обработка чекбокса "Я владелец"
    document.querySelectorAll('input[name="is_owner"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const contactField = e.target.parentElement.nextElementSibling;
            contactField.classList.toggle('hidden', !e.target.checked);
            contactField.disabled = !e.target.checked;
            const activeSection = document.querySelector('input[name="type"]:checked')?.value;
            if (e.target.checked && (activeSection === 'add' || activeSection === 'edit')) {
                contactField.setAttribute('required', '');
            } else {
                contactField.removeAttribute('required');
            }
        });
    });

    // Отправка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.querySelector('input[name="type"]:checked')?.value;
        if (!type) {
            alert('Пожалуйста, выберите тип отзыва.');
            return;
        }

        const data = {
            type,
            timestamp: new Date().toISOString(),
            checked: false
        };

        switch (type) {
            case 'add':
                data.name = addForm.querySelector('input[name="name"]').value;
                data.description = addForm.querySelector('textarea[name="description"]').value;
                data.maps_url = addForm.querySelector('input[name="maps_url"]').value;
                data.is_owner = addForm.querySelector('input[name="is_owner"]').checked;
                if (data.is_owner) {
                    data.contact = addForm.querySelector('input[name="contact"]').value;
                }
                break;
            case 'edit':
                data.place = editForm.querySelector('select[name="place"]').value;
                data.suggestion = editForm.querySelector('textarea[name="suggestion"]').value;
                data.is_owner = editForm.querySelector('input[name="is_owner"]').checked;
                if (data.is_owner) {
                    data.contact = editForm.querySelector('input[name="contact"]').value;
                }
                break;
            case 'feedback':
                data.message = feedbackForm.querySelector('textarea[name="message"]').value;
                data.contact = feedbackForm.querySelector('input[name="contact"]').value || null;
                break;
        }

        fetch('./save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to save feedback');
            }
            return response.json();
        }).then(() => {
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');
            form.reset();
            typeRadios.forEach(radio => radio.checked = false);
            setTimeout(() => successMessage.classList.add('hidden'), 5000);
        }).catch(error => {
            console.error('Error saving feedback:', error);
            alert('Ошибка при отправке отзыва. Попробуйте снова.');
        });
    });
});
