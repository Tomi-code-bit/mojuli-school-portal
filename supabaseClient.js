/**
 * Mojuli Christ Glorious School — Supabase Integration Client
 * Handles Cloud Database, Authentication (including GitHub OAuth), and Storage.
 * Gracefully falls back to local storage if credentials are not yet configured.
 */

const SupabaseService = (function () {
  let client = null;
  let isConnected = false;
  let listeners = [];

  // Default localStorage keys
  const STORAGE_KEY_URL = 'mjl_supabase_url';
  const STORAGE_KEY_KEY = 'mjl_supabase_key';

  // Default project credentials
  const DEFAULT_SUPABASE_URL = 'https://kokgtrbvawmvstkebudd.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtva2d0cmJ2YXdtdnN0a2VidWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTAwMzcsImV4cCI6MjEwNjE2NjAzN30.fPFRyA0UIwNuUWUjSfNlcpWVBs3VScDHSYpi2dbxCjs';

  function getConfig() {
    let url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
    let key = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_SUPABASE_KEY;
    if (url) {
      url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    }
    return { url, key };
  }

  function saveConfig(url, key) {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    else localStorage.removeItem(STORAGE_KEY_KEY);

    init();
  }

  function isConfigured() {
    const { url, key } = getConfig();
    return Boolean(url && key && url.startsWith('http'));
  }

  function getClient() {
    if (!client && isConfigured() && window.supabase) {
      const { url, key } = getConfig();
      try {
        client = window.supabase.createClient(url, key);
      } catch (e) {
        console.error('Failed to create Supabase client:', e);
      }
    }
    return client;
  }

  async function testConnection(url, key) {
    const testUrl = url || getConfig().url;
    const testKey = key || getConfig().key;

    if (!testUrl || !testKey) {
      return { success: false, message: 'Please provide both Supabase Project URL and Anon Public Key.' };
    }

    if (!window.supabase) {
      return { success: false, message: 'Supabase JS SDK library not loaded.' };
    }

    try {
      const tempClient = window.supabase.createClient(testUrl.trim(), testKey.trim());
      // Run lightweight ping on announcements or public schema
      const start = performance.now();
      const { data, error } = await tempClient
        .from('announcements')
        .select('id')
        .limit(1);

      const elapsed = Math.round(performance.now() - start);

      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet if schema hasn't been run
        if (error.message && error.message.includes('relation "public.announcements" does not exist')) {
          return {
            success: true,
            needsSchema: true,
            latency: elapsed,
            message: `Connected to Supabase in ${elapsed}ms! Note: Schema tables not yet created. Please run supabase_schema.sql in your Supabase SQL Editor.`
          };
        }
        return { success: false, message: error.message || 'Connection failed' };
      }

      return {
        success: true,
        latency: elapsed,
        message: `Successfully connected to Supabase in ${elapsed}ms!`
      };
    } catch (err) {
      return { success: false, message: err.message || 'Network error connecting to Supabase.' };
    }
  }

  function onStatusChange(callback) {
    listeners.push(callback);
  }

  function notifyStatus(status) {
    listeners.forEach(cb => cb(status));
  }

  async function init() {
    client = null;
    if (!isConfigured()) {
      isConnected = false;
      notifyStatus({ configured: false, connected: false });
      return;
    }

    const test = await testConnection();
    isConnected = test.success;
    notifyStatus({
      configured: true,
      connected: isConnected,
      needsSchema: test.needsSchema,
      latency: test.latency,
      message: test.message
    });

    if (isConnected) {
      getClient();
      listenAuth();
    }
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION (GitHub OAuth + Local fallback)
  // --------------------------------------------------------------------------
  async function signInWithGitHub() {
    const sb = getClient();
    if (!sb) {
      alert('Please configure your Supabase Project URL and Anon Key in Portal Settings first.');
      return;
    }

    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await sb.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('GitHub Sign-in Error:', err);
      alert('GitHub Sign-in Error: ' + err.message);
    }
  }

  async function signOut() {
    const sb = getClient();
    if (sb) {
      await sb.auth.signOut();
    }
  }

  async function getCurrentUser() {
    const sb = getClient();
    if (!sb) return null;
    try {
      const { data: { user } } = await sb.auth.getUser();
      return user;
    } catch (e) {
      return null;
    }
  }

  function listenAuth() {
    const sb = getClient();
    if (!sb) return;
    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in via Supabase:', session.user);
        const user = session.user;
        const name = user.user_metadata?.full_name || user.user_metadata?.user_name || user.email;
        if (window.toast) {
          window.toast(`Welcome, ${name}! Signed in via GitHub.`);
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 1. ADMISSIONS APPLICATIONS
  // --------------------------------------------------------------------------
  async function submitAdmission(app) {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        const { data, error } = await sb.from('admissions_applications').insert([{
          ref_id: app.id,
          name: app.name,
          dob: app.dob,
          gender: app.gender,
          prev_school: app.prevSchool,
          class_level: app.cls,
          parent_name: app.parent,
          phone: app.phone,
          email: app.email,
          address: app.address,
          emergency_contact: app.emergency,
          status: app.status || 'Pending'
        }]);
        if (error) console.warn('Supabase admissions insert error:', error);
      } catch (e) {
        console.warn('Supabase admissions insert failed:', e);
      }
    }
  }

  async function fetchAdmissions() {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        const { data, error } = await sb
          .from('admissions_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length) {
          return data.map(d => ({
            id: d.ref_id,
            name: d.name,
            dob: d.dob,
            gender: d.gender,
            prevSchool: d.prev_school,
            cls: d.class_level,
            parent: d.parent_name,
            phone: d.phone,
            email: d.email,
            address: d.address,
            emergency: d.emergency_contact,
            date: new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: d.status
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch admissions error:', e);
      }
    }
    return null; // fallback to local DB
  }

  async function updateAdmissionStatus(refId, newStatus) {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        await sb.from('admissions_applications').update({ status: newStatus }).eq('ref_id', refId);
      } catch (e) {
        console.warn('Supabase update admission error:', e);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 2. TEACHER & STAFF APPLICATIONS
  // --------------------------------------------------------------------------
  async function submitStaffApplication(app) {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        await sb.from('staff_applications').insert([{
          applicant_name: app.name,
          email: app.email,
          phone: app.phone,
          class_applied: app.cls,
          score_percentage: app.score,
          correct_answers: app.correct,
          total_questions: app.total,
          status: app.status || 'Pending Review'
        }]);
      } catch (e) {
        console.warn('Supabase staff app insert error:', e);
      }
    }
  }

  async function fetchStaffApplications() {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        const { data, error } = await sb
          .from('staff_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length) {
          return data.map(d => ({
            id: d.id,
            name: d.applicant_name,
            email: d.email,
            phone: d.phone,
            cls: d.class_applied,
            score: d.score_percentage,
            correct: d.correct_answers,
            total: d.total_questions,
            date: new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: d.status
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch staff apps error:', e);
      }
    }
    return null;
  }

  async function updateStaffAppStatus(id, newStatus) {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        await sb.from('staff_applications').update({ status: newStatus }).eq('id', id);
      } catch (e) {
        console.warn('Supabase update staff app status error:', e);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. ANNOUNCEMENTS
  // --------------------------------------------------------------------------
  async function publishAnnouncement(ann) {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        await sb.from('announcements').insert([{
          title: ann.title,
          body: ann.body,
          date_display: ann.date
        }]);
      } catch (e) {
        console.warn('Supabase announcement insert error:', e);
      }
    }
  }

  async function fetchAnnouncements() {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        const { data, error } = await sb
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length) {
          return data.map(d => ({
            id: d.id,
            title: d.title,
            body: d.body,
            date: d.date_display || new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch announcements error:', e);
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 4. FORUM THREADS & COMMENTS
  // --------------------------------------------------------------------------
  async function postForumThread(t) {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        const { data, error } = await sb.from('forum_threads').insert([{
          category: t.cat,
          title: t.title,
          author: t.author,
          body: t.body,
          pinned: t.pinned || false,
          date_display: t.date
        }]).select();

        if (!error && data && data[0]) {
          return data[0].id;
        }
      } catch (e) {
        console.warn('Supabase forum thread insert error:', e);
      }
    }
    return null;
  }

  async function postForumComment(threadId, c) {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        await sb.from('forum_comments').insert([{
          thread_id: threadId,
          author: c.author,
          body: c.body,
          date_display: c.date
        }]);
      } catch (e) {
        console.warn('Supabase forum comment insert error:', e);
      }
    }
  }

  async function fetchForumThreads() {
    const sb = getClient();
    if (sb && isConnected) {
      try {
        const { data: threads, error } = await sb
          .from('forum_threads')
          .select('*, forum_comments(*)')
          .order('created_at', { ascending: false });

        if (!error && threads && threads.length) {
          return threads.map(t => ({
            id: t.id,
            cat: t.category,
            title: t.title,
            author: t.author,
            body: t.body,
            pinned: t.pinned,
            date: t.date_display || new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            comments: (t.forum_comments || []).map(c => ({
              author: c.author,
              body: c.body,
              date: c.date_display || new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            }))
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch forum threads error:', e);
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 5. BULK SYNC LOCAL DATA TO SUPABASE
  // --------------------------------------------------------------------------
  async function syncLocalToSupabase(localData) {
    const sb = getClient();
    if (!sb || !isConnected) {
      return { success: false, message: 'Supabase is not connected.' };
    }

    let synced = { admissions: 0, staff: 0, announcements: 0 };
    try {
      // 1. Sync admissions
      if (localData.applications?.length) {
        for (const app of localData.applications) {
          const { error } = await sb.from('admissions_applications').upsert({
            ref_id: app.id,
            name: app.name,
            dob: app.dob,
            gender: app.gender,
            prev_school: app.prevSchool,
            class_level: app.cls,
            parent_name: app.parent,
            phone: app.phone,
            email: app.email,
            address: app.address,
            emergency_contact: app.emergency,
            status: app.status || 'Pending'
          }, { onConflict: 'ref_id' });
          if (!error) synced.admissions++;
        }
      }

      // 2. Sync staff applications
      if (localData.staffApplications?.length) {
        for (const app of localData.staffApplications) {
          const { error } = await sb.from('staff_applications').insert([{
            applicant_name: app.name,
            email: app.email,
            phone: app.phone,
            class_applied: app.cls,
            score_percentage: app.score,
            correct_answers: app.correct,
            total_questions: app.total,
            status: app.status || 'Pending Review'
          }]);
          if (!error) synced.staff++;
        }
      }

      // 3. Sync announcements
      if (localData.announcements?.length) {
        for (const ann of localData.announcements) {
          const { error } = await sb.from('announcements').insert([{
            title: ann.title,
            body: ann.body,
            date_display: ann.date
          }]);
          if (!error) synced.announcements++;
        }
      }

      return {
        success: true,
        message: `Synced ${synced.admissions} applications, ${synced.staff} teacher assessments, and ${synced.announcements} announcements to Supabase Cloud!`
      };
    } catch (err) {
      return { success: false, message: 'Sync error: ' + err.message };
    }
  }

  return {
    init,
    getConfig,
    saveConfig,
    isConfigured,
    testConnection,
    onStatusChange,
    signInWithGitHub,
    signOut,
    getCurrentUser,
    // Admissions
    submitAdmission,
    fetchAdmissions,
    updateAdmissionStatus,
    // Staff
    submitStaffApplication,
    fetchStaffApplications,
    updateStaffAppStatus,
    // Announcements
    publishAnnouncement,
    fetchAnnouncements,
    // Forum
    postForumThread,
    postForumComment,
    fetchForumThreads,
    // Bulk sync
    syncLocalToSupabase
  };
})();

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.SupabaseService = SupabaseService;
}
