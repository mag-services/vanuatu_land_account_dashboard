import { memo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { FeatureCollection } from 'geojson'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategoryColor } from '@/lib/landCoverColors'
import type { ByProvinceRow } from '@/types/landCover'

const GADM_PROVINCES_URL = 'https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_VUT_1.json'

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
    if (!geojson || !hasProvinces || selectedProvinces.length === 0) return
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
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12, animate: true })
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
    for (const [cat, area] of cats) {
      total += area
      if (area > dominantArea) {
        dominant = cat
        dominantArea = area
      }
    }
    result.push({ province, dominantCategory: dominant, dominantArea, totalArea: total })
  }
  return result
}

export const ProvinceMap = memo(function ProvinceMap({ byProvince }: ProvinceMapProps) {
  const [geojson, setGeojson] = useState<GeoJSON.GeoJsonObject | FeatureCollection | null>(null)

  const provinceStats = getProvinceStats(byProvince)
  const selectedProvinces = [...new Set(byProvince.map((r) => r.province))]

  useEffect(() => {
    fetch(GADM_PROVINCES_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then(setGeojson)
      .catch(() => {
        fetch(`${import.meta.env.BASE_URL}assets/vanuatu-provinces.geojson`)
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
          .then(setGeojson)
          .catch(() => {
            fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/VU.geo.json')
              .then((res) => res.json())
              .then(setGeojson)
              .catch(() => {})
          })
      })
  }, [])

  const fc = geojson && 'features' in geojson ? (geojson as FeatureCollection) : null
  const hasProvinces = fc?.features?.length && fc.features.length > 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vanuatu Map</CardTitle>
        <p className="text-sm text-muted-foreground">
          {hasProvinces ? 'Provinces colored by dominant land cover 2023.' : 'Country overview.'} Hover for details.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] overflow-hidden rounded-lg border border-border/60">
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
                  return (
                    <GeoJSON
                      key={i}
                      data={feature}
                      style={{
                        fillColor: color,
                        fillOpacity: 0.65,
                        color: '#334155',
                        weight: 1.5,
                      }}
                    >
                      <Popup>
                        <div className="min-w-[160px] text-sm">
                          <strong>{name}</strong>
                          {stats ? (
                            <>
                              <br />
                              Dominant: {stats.dominantCategory}
                              <br />
                              Area: {stats.dominantArea.toFixed(0)} sq km
                              <br />
                              Total: {stats.totalArea.toFixed(0)} sq km
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
