import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

interface CacheOptions {
  ttlMinutes?: number;
  forceRefresh?: boolean;
}

export async function getCachedData(endpoint: string, options: CacheOptions = {}) {
  if (options.forceRefresh) {
    await invalidateCache(endpoint);
    return null;
  }
  
  const { data, error } = await supabase
    .from('cached_responses')
    .select('*')
    .eq('endpoint', endpoint)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error) {
    console.warn(`Cache miss for ${endpoint}:`, error.message);
    return null;
  }
  
  return data?.data;
}

export async function setCachedData(
  endpoint: string,
  data: any,
  ttlMinutes = 60
) {
  const expires_at = new Date();
  expires_at.setMinutes(expires_at.getMinutes() + ttlMinutes);

  const { error } = await supabase
    .from('cached_responses')
    .upsert({
      endpoint,
      data,
      expires_at: expires_at.toISOString(),
      cached_at: new Date().toISOString()
    }, {
      onConflict: 'endpoint'
    });

  if (error) throw new Error(error.message);
}

export async function invalidateCache(endpoint: string) {
  const { error } = await supabase
    .from('cached_responses')
    .delete()
    .eq('endpoint', endpoint);

  if (error) throw new Error(error.message);
}

export async function invalidateAllCache() {
  const { error } = await supabase
    .from('cached_responses')
    .delete()
    .lte('expires_at', new Date().toISOString());

  if (error) throw new Error(error.message);
} 