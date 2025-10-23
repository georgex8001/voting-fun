import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { onFheStatusChange } from './useContract'

/**
 * 监听 FHE Gateway 状态变化并显示 Toast 通知
 */
export function useFheStatusNotifications() {
  const previousStatus = useRef('unknown')

  useEffect(() => {
    const unsubscribe = onFheStatusChange((newStatus) => {
      // 首次加载时不显示通知
      if (previousStatus.current === 'unknown' && newStatus !== 'unknown') {
        previousStatus.current = newStatus
        return
      }

      // Show notification on status change
      if (previousStatus.current !== newStatus && previousStatus.current !== 'unknown') {
        if (newStatus === 'up') {
          toast.success(
            '🟢 FHE Gateway Restored\nEncryption now available',
            {
              duration: 5000,
              style: {
                background: '#10b981',
                color: '#fff',
                fontWeight: 'bold',
              },
              icon: '🔐',
            }
          )
        } else if (newStatus === 'down') {
          toast.error(
            '🟡 FHE Gateway Unavailable\nSwitched to Fallback mode',
            {
              duration: 5000,
              style: {
                background: '#f59e0b',
                color: '#fff',
                fontWeight: 'bold',
              },
              icon: '⚠️',
            }
          )
        }
      }

      previousStatus.current = newStatus
    })

    return unsubscribe
  }, [])
}

