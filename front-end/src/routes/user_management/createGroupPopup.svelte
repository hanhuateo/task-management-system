<script>
    export let showModal; // Parent controls visibility
    export let closeModal; // Function to close the modal
    let groupName = '';
  
    function createGroup() {
      if (groupName.trim()) {
        alert(`Group "${groupName}" created!`);
        // You can add additional logic for group creation, such as API calls
        closeModal();
      }
    }
  </script>
  
  <style>
    /* Modal (Popup) container styles */
    .modal {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* Dark background */
      justify-content: center;
      align-items: center;
      z-index: 10;
    }
  
    /* Modal content (form) */
    .modal-content {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      width: 400px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  
    .modal-content h2 {
      margin-bottom: 1rem;
    }
  
    input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    .button-container {
      display: flex;
      justify-content: space-between;
    }
  
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
    }
  
    .close-btn {
      background-color: lightgray;
      color: black;
    }
  
    .create-btn {
      background-color: #007bff;
      color: white;
    }
  
    button:hover {
      opacity: 0.9;
    }
  </style>
  
  {#if showModal}
    <div class="modal">
      <div class="modal-content">
        <h2>Create Group</h2>
        <input type="text" placeholder="Group name" bind:value={groupName} />
  
        <div class="button-container">
          <button class="close-btn" on:click={closeModal}>Close</button>
          <button class="create-btn" on:click={createGroup}>Create Group</button>
        </div>
      </div>
    </div>
  {/if}
  