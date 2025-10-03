document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notesContainer = document.getElementById('notesContainer');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteForm = document.getElementById('noteForm');
    const noteModal = document.getElementById('noteModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    // State variables
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentView = 'grid'; // 'grid' or 'list'
    let editNoteId = null;
    
    // Initialize the app
    function init() {
        renderNotes();
        createParticles();
        
        // Load sample notes if empty
        if (notes.length === 0) {
            addSampleNotes();
        }
    }
    
    // Add sample notes
    function addSampleNotes() {
        const sampleNotes = [
            {
                id: Date.now(),
                title: 'Welcome to Neon Notes',
                content: 'This is your first note. You can edit, delete, or pin it. Try creating a new note!',
                category: 'personal',
                pinned: true,
                timestamp: Date.now()
            },
            {
                id: Date.now() + 1,
                title: 'Meeting Notes',
                content: 'Discuss project timeline\nReview design mockups\nAssign tasks for next sprint',
                category: 'work',
                pinned: false,
                timestamp: Date.now() - 3600000
            },
            {
                id: Date.now() + 2,
                title: 'Creative Ideas',
                content: 'Mobile app with AR features\nBlog post about modern web design\nPodcast episode about productivity',
                category: 'ideas',
                pinned: true,
                timestamp: Date.now() - 7200000
            }
        ];
        
        notes = [...sampleNotes];
        saveNotes();
        renderNotes();
    }
    
    // Create background particles
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 6}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // Save notes to localStorage
    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
    
    // Render notes based on current view and filters
    function renderNotes(filteredNotes = null) {
        const notesToRender = filteredNotes || notes;
        notesContainer.innerHTML = '';
        
        // Sort notes - pinned first, then by timestamp (newest first)
        const sortedNotes = [...notesToRender].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.timestamp - a.timestamp;
        });
        
        if (sortedNotes.length === 0) {
            notesContainer.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <svg class="mx-auto h-12 w-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-purple-100">No notes found</h3>
                    <p class="mt-1 text-sm text-purple-200">Create your first note by clicking "New Note"</p>
                </div>
            `;
            return;
        }
        
        sortedNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
        
        // Update container class based on view mode
        updateViewMode();
    }
    
    // Create a note element
    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        
        // Format timestamp
        const date = new Date(note.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Category colors
        const categoryColors = {
            work: 'bg-blue-600/20 text-blue-400',
            personal: 'bg-purple-600/20 text-purple-400',
            ideas: 'bg-yellow-600/20 text-yellow-400',
            study: 'bg-green-600/20 text-green-400'
        };
        
        noteElement.className = 'note-card rounded-xl p-5' + (note.pinned ? ' pinned' : '');
        noteElement.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold text-white truncate">${note.title}</h3>
                <div class="flex items-center gap-2">
                    <button class="edit-btn p-1 text-gray-400 hover:text-purple-400 transition-colors" data-id="${note.id}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn p-1 text-gray-400 hover:text-red-400 transition-colors" data-id="${note.id}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                    <button class="pin-btn p-1 ${note.pinned ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'} transition-colors" data-id="${note.id}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <p class="text-gray-300 mb-4 line-clamp-3">${note.content.replace(/\n/g, '<br>')}</p>
            
            <div class="flex justify-between items-center text-sm text-gray-400">
                <span class="px-3 py-1 rounded-full ${categoryColors[note.category]} category-tag">
                    ${note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                </span>
                <span>${formattedDate}</span>
            </div>
        `;
        
        return noteElement;
    }
    
    // Open modal to add/edit note
    function openModal(note = null) {
        const modalTitle = document.getElementById('modalTitle');
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const noteCategory = document.getElementById('noteCategory');
        const notePinned = document.getElementById('notePinned');
        const noteId = document.getElementById('noteId');
        
        if (note) {
            // Edit existing note
            modalTitle.textContent = 'Edit Note';
            noteId.value = note.id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            noteCategory.value = note.category;
            notePinned.checked = note.pinned;
            editNoteId = note.id;
        } else {
            // Add new note
            modalTitle.textContent = 'Add New Note';
            noteId.value = '';
            noteTitle.value = '';
            noteContent.value = '';
            noteCategory.value = 'personal';
            notePinned.checked = false;
            editNoteId = null;
        }
        
        noteModal.classList.remove('hidden');
        noteTitle.focus();
    }
    
    // Close modal
    function closeModal() {
        noteModal.classList.add('hidden');
        editNoteId = null;
        noteForm.reset();
    }
    
    // Filter notes based on search input and category
    function filterNotes() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        
        let filteredNotes = notes;
        
        // Filter by category if not 'all'
        if (category !== 'all') {
            filteredNotes = filteredNotes.filter(note => note.category === category);
        }
        
        // Filter by search term if exists
        if (searchTerm) {
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            );
        }
        
        renderNotes(filteredNotes);
    }
    
    // Update view mode (grid/list)
    function updateViewMode() {
        if (currentView === 'grid') {
            notesContainer.classList.remove('grid-cols-1');
            notesContainer.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
            gridViewBtn.classList.add('bg-purple-800/50');
            listViewBtn.classList.remove('bg-purple-800/50');
        } else {
            notesContainer.classList.remove('md:grid-cols-2', 'lg:grid-cols-3');
            notesContainer.classList.add('grid-cols-1');
            gridViewBtn.classList.remove('bg-purple-800/50');
            listViewBtn.classList.add('bg-purple-800/50');
        }
    }
    
    // Event Listeners
    addNoteBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    
    noteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const noteId = document.getElementById('noteId').value;
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const category = document.getElementById('noteCategory').value;
        const pinned = document.getElementById('notePinned').checked;
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        if (editNoteId) {
            // Update existing note
            const noteIndex = notes.findIndex(note => note.id == editNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex] = {
                    id: editNoteId,
                    title,
                    content,
                    category,
                    pinned,
                    timestamp: Date.now()
                };
            }
        } else {
            // Create new note
            notes.push({
                id: Date.now(),
                title,
                content,
                category,
                pinned,
                timestamp: Date.now()
            });
        }
        
        saveNotes();
        renderNotes();
        closeModal();
    });
    
    // Click events for note actions (using event delegation)
    notesContainer.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        const pinBtn = e.target.closest('.pin-btn');
        
        if (deleteBtn) {
            const noteId = deleteBtn.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(note => note.id != noteId);
                saveNotes();
                renderNotes();
            }
        }
        
        if (editBtn) {
            const noteId = editBtn.getAttribute('data-id');
            const noteToEdit = notes.find(note => note.id == noteId);
            if (noteToEdit) {
                openModal(noteToEdit);
            }
        }
        
        if (pinBtn) {
            const noteId = pinBtn.getAttribute('data-id');
            const noteIndex = notes.findIndex(note => note.id == noteId);
            if (noteIndex !== -1) {
                notes[noteIndex].pinned = !notes[noteIndex].pinned;
                saveNotes();
                renderNotes();
            }
        }
    });
    
    searchInput.addEventListener('input', filterNotes);
    categoryFilter.addEventListener('change', filterNotes);
    gridViewBtn.addEventListener('click', () => {
        currentView = 'grid';
        updateViewMode();
    });
    listViewBtn.addEventListener('click', () => {
        currentView = 'list';
        updateViewMode();
    });
    
    // Initialize the app
    init();
});