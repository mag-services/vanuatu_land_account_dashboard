import { memo, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { FeatureCollection } from 'geojson'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategoryColor } from '@/lib/landCoverColors'
import type { ByProvinceRow } from '@/types/landCover'

const PROVINCES_GEOJSON_URL = `${import.meta.env.BASE_URL}assets/vanuatu-provinces.geojson`

function getFeatureProvinceName(feature: GeoJSON.Feature): string {
  const props = (feature.properties ?? {}) as Record<string, string>
  return (props.ADM1_EN ?? props.name ?? props.NAME_1 ?? props.Province ?? '').trim()
}

function MapBoundsFitter({
  geojson,
  selectedProvinces,
  hasProvinces,
}: {
  geojson: GeoJSON.GeoJsonObject | FeatureCollection | null
  selectedProvinces: string[]
  hasProvinces: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (!geojson || !hasProvinces) return
    const fc = geojson as FeatureCollection
    const selectedSet = new Set(selectedProvinces.map((p) => p.toLowerCase()))
    const matchingFeatures = fc.features.filter((f) => {
      const name = getFeatureProvinceName(f)
      return name && selectedSet.has(name.toLowerCase())
    })
    const featuresToFit = matchingFeatures.length > 0 ? matchingFeatures : fc.features
    try {
      const layer = L.geoJSON({ type: 'FeatureCollection', features: featuresToFit } as GeoJSON.FeatureCollection)
      const bounds = layer.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11, animate: true })
      }
    } catch {
      // ignore
    }
  }, [map, geojson, hasProvinces, selectedProvinces])

  return null
}

interface ProvinceStats {
  province: string
  dominantCategory: string
  dominantArea: number
  totalArea: number
  categories: { name: string; area: number }[]
}

interface ProvinceMapProps {
  byProvince: ByProvinceRow[]
}

const CENTER: [number, number] = [-16.5, 168]
const ZOOM = 7

function getProvinceStats(byProvince: ByProvinceRow[]): ProvinceStats[] {
  const byProv = new Map<string, Map<string, number>>()
  for (const r of byProvince.filter((x) => x.year === 2023)) {
    if (!byProv.has(r.province)) byProv.set(r.province, new Map())
    const cat = byProv.get(r.province)!
    cat.set(r.category, (cat.get(r.category) ?? 0) + r.area)
  }
  const result: ProvinceStats[] = []
  for (const [province, cats] of byProv) {
    let dominant = ''
    let dominantArea = 0
    let total = 0
    const sorted = [...cats.entries()]
      .map(([name, area]) => {
        total += area
        if (area > dominantArea) {
          dominant = name
          dominantArea = area
        }
        return { name, area }
      })
      .sort((a, b) => b.area - a.area)
    result.push({
      province,
      dominantCategory: dominant,
      dominantArea,
      totalArea: total,
      categories: sorted,
    })
  }
  return result
}

export const ProvinceMap = memo(function ProvinceMap({ byProvince }: ProvinceMapProps) {
  const [geojson, setGeojson] = useState<GeoJSON.GeoJsonObject | FeatureCollection | null>(null)

  const provinceStats = getProvinceStats(byProvince)
  const selectedProvinces = [...new Set(byProvince.map((r) => r.province))]

  const legendCategories = useMemo(() => {
    const seen = new Set<string>()
    for (const s of provinceStats) {
      if (s.dominantCategory) seen.add(s.dominantCategory)
    }
    return [...seen].sort()
  }, [provinceStats])

  useEffect(() => {
    fetch(PROVINCES_GEOJSON_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then(setGeojson)
      .catch(() => {})
  }, [])

  const fc = geojson && 'features' in geojson ? (geojson as FeatureCollection) : null
  const hasProvinces = fc?.features?.length && fc.features.length > 1

  return (
    <Card className="border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Vanuatu Map</CardTitle>
        <p className="text-sm text-muted-foreground">
          {hasProvinces ? 'Provinces colored by dominant land cover 2023.' : 'Country overview.'} Hover for details.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative h-[320px] overflow-hidden rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg ring-1 ring-black/5">
          <MapContainer
            center={CENTER}
            zoom={ZOOM}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBoundsFitter
              geojson={geojson}
              selectedProvinces={selectedProvinces}
              hasProvinces={!!hasProvinces}
            />
            {geojson && (
              hasProvinces ? (
                fc.features.map((feature, i) => {
                  const props = (feature.properties ?? {}) as Record<string, string>
                  const name = props.ADM1_EN ?? props.name ?? props.NAME_1 ?? props.Province ?? `Province ${i + 1}`
                  const stats = provinceStats.find((s) => s.province === name)
                  const color = stats ? getCategoryColor(stats.dominantCategory) : '#94a3b8'
                  const baseStyle = {
                    fillColor: color,
                    fillOpacity: 0.65,
                    color: '#334155',
                    weight: 1.5,
                  }
                  return (
                    <GeoJSON
                      key={i}
                      data={feature}
                      style={baseStyle}
                      onEachFeature={(_, layer) => {
                        layer.on('mouseover', () => {
                          layer.setStyle({
                            ...baseStyle,
                            weight: 2.5,
                            fillOpacity: 0.88,
                            color: '#1e293b',
                          })
                          layer.bringToFront()
                        })
                        layer.on('mouseout', () => {
                          layer.setStyle(baseStyle)
                        })
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px] text-sm">
                          <strong className="text-base">{name}</strong>
                          {stats ? (
                            <>
                              <div className="mt-2 space-y-1 border-t border-border/60 pt-2">
                                {stats.categories.slice(0, 3).map((c) => (
                                  <div
                                    key={c.name}
                                    className="flex items-center gap-2"
                                  >
                                    <span
                                      className="size-3 shrink-0 rounded-sm"
                                      style={{
                                        backgroundColor: getCategoryColor(c.name),
                                      }}
                                    />
                                    <span className="flex-1">{c.name}</span>
                                    <span className="tabular-nums text-muted-foreground">
                                      {c.area.toFixed(0)} sq km
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 flex justify-between border-t border-border/60 pt-2 font-semibold">
                                <span>Total</span>
                                <span>{stats.totalArea.toFixed(0)} sq km</span>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </Popup>
                    </GeoJSON>
                  )
                })
              ) : (
                <GeoJSON
                  data={geojson}
                  style={{
                    fillColor: '#52b788',
                    fillOpacity: 0.55,
                    color: '#334155',
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="min-w-[140px] text-sm">
                      <strong>Vanuatu</strong>
                      <br />
                      Land cover data for 6 provinces. Add vanuatu-provinces.geojson for province-level map.
                    </div>
                  </Popup>
                </GeoJSON>
              )
            )}
          </MapContainer>
          {hasProvinces && legendCategories.length > 0 && (
            <div
              className="absolute bottom-2 right-2 z-[1000] rounded-lg border border-white/20 bg-white/80 px-3 py-2 shadow-lg backdrop-blur-md dark:border-gray-700/30 dark:bg-gray-900/80"
              aria-label="Map legend"
            >
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dominant land cover
              </p>
              <div className="space-y-1">
                {legendCategories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="size-3.5 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: getCategoryColor(cat),
                      }}
                    />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {!hasProvinces && geojson && (
          <p className="mt-2 text-xs text-muted-foreground">
            Add public/assets/vanuatu-provinces.geojson for province-level coloring.
          </p>
        )}
      </CardContent>
    </Card>
  )
})
